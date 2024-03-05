const fs = require('fs')
const https = require('https')
const express = require('express')
const socketIO = require('socket.io')
const cors = require('cors')
const app = express()
const port = 4000
const privateKey = fs.readFileSync('key.pem', 'utf8')
const certificate = fs.readFileSync('cert.pem', 'utf8')
const db = require('./utils/db')
const utils = require('./utils/utils')
const Delta = require('quill-delta')

const httpsServer = https.createServer({
    key: privateKey,
    cert: certificate
},
    app
)


const io = socketIO(httpsServer, {
    cors: {
        origin: "*"
    },
    // Support 10mb buffer.
    maxHttpBufferSize: 1e7
})

app.use(cors())

// Map to maintain userlist for rooms. 
// The value contains object {socketId, username} if socketIds need to be accessed later for diagnostics etc.
// TODO: Probably worth a refactor
// Learned afterwards... :D This could have probably been made a lot easier by assigning username to the socket itself 
// Check Selection of the username: https://socket.io/get-started/private-messaging-part-1/
const roomUserMap = new Map(Object.keys(db.dataToJson()).map((key) => [key, []]))

// TODO: Files in edit could be stored here as a map: file : {[users], delta}
// When new socket joins edit session the combined delta is emitted to that socket
// Sockets emit edit events that contain delta for each change and the server combines these
// When file is saved it is updated to the "DB"
// When all sockets leave the edit session. The key value pair from map can be deleted.
// const fileEditSessionMap = new Map()
let fileEdits

io.on('connection', (socket) => {

    const data = db.dataToJson()
    socket.on('room-list', () => {
        socket.emit('room-list', Object.keys(data));
    })

    socket.on('file-upload', (data, cb) => {
        const [defaultRoom, currentRoom] = socket.rooms
        try {
            const savedFilename = db.saveFile(currentRoom, data.name, data.size, data.rawData)
            io.to(currentRoom).emit('file-upload', {roomName: currentRoom, filename: savedFilename})
        } catch(e) {
            cb("Error saving file")
        }
    })

    socket.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.roomName) {
            io.to(data.roomName).emit("message", data)
            db.writeMessage(data.roomName, data.username, data.message)
        } else {
            io.emit('message', msg);
        }
    })

    socket.on('join', ({username, roomName}, cb) => {
        socket.auth = {username: "asdf"}
        let data = db.dataToJson();
        if (!(roomName in data)) {
            console.log('Creating room: ', roomName)
            data[roomName] = {messages: [], files: []}
            db.writeToFile(data)
            io.emit('room-list', Object.keys(data));
            roomUserMap.set(roomName, [])
        }
        console.log('Joining room: ', roomName);
        if (socket.rooms.size > 1) utils.removeFromRoom(Array.from(socket.rooms)[1], roomUserMap, socket, io)
        socket.join(roomName);

        // Emit userList when user joins
        const updatedUserlist = [...roomUserMap.get(roomName), {socket: socket.id, username}]
        roomUserMap.set(roomName, updatedUserlist)
        io.to(roomName).emit("join", updatedUserlist.map(object => object.username))

        cb(data[roomName]);
    })

    socket.on('delete-room', ({roomName}) => {
        console.log(`Deleting room: ${roomName}`);
        let data = db.dataToJson()
        delete data[roomName]
        db.writeToFile(data)
        db.deleteRoomData(roomName)

        // Signal to everyone that the room has been deleted
        // Kick them out (do it on the frontend side)
        io.to(roomName).emit('delete-room')
        io.in(roomName).socketsLeave(roomName);
        roomUserMap.delete(roomName)
        // Emit the new updated room list.
        io.emit('room-list', Object.keys(data));
    })

    socket.on('edit-start', () => {
        if(!fileEdits) fileEdits = new Delta()
        console.log(fileEdits)
        socket.emit("edit-start", fileEdits)
    })

    socket.on('edit', (delta) => {
        fileEdits = fileEdits.compose(delta)
        // console.log('edit: ' + JSON.stringify(delta))
        // console.log('whole delta: ' + JSON.stringify(fileEdits))
        // Send changes to other sockets
        socket.broadcast.emit('edit', fileEdits);
    })

    // socket.on('edit-save', (data) => {
    // })
    // socket.on('edit-leave', (data) => {
    // })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
        // Remove user from room on disconnect
        const previousRoom = utils.findRoomBySocket(roomUserMap, socket.id)
        if (previousRoom) utils.removeFromRoom(previousRoom, roomUserMap, socket, io)
    })
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/room/:roomName/:filename', (req, res) => {
    const { roomName, filename } = req.params
    try {
        const file = db.getFile(roomName, filename)
        file !== ""
        ? res.sendFile(file, { root: "./data"})
        : res.status(404)
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

httpsServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})