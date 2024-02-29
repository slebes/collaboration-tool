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

// eslint-disable-next-line no-unused-vars
let intervalId
// Map to maintain userlist for rooms. 
// The value contains object {socketId, username} if socketIds need to be accessed later for diagnostics etc.
// TODO: Probably worth a refactor
// Learned afterwards... :D This could have probably been made a lot easier by assigning username to the socket itself 
// Check Selection of the username: https://socket.io/get-started/private-messaging-part-1/
const roomUserMap = new Map(Object.keys(db.dataToJson()).map((key) => [key, []]))

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

        // Load the messages of the specific room
        const room = {
            roomName: roomName,
            ...data[roomName]
        };
        cb(room);
    })

    socket.on('delete-room', roomName => {
        let data = db.dataToJson()
        delete data[roomName]
        db.writeToFile(data)

        // Signal to everyone that the room has been deleted
        // Kick them out (do it on the frontend side)
        io.to(roomName).emit('delete-room')
        io.in(roomName).socketsLeave(roomName);
        roomUserMap.delete(roomName)
        // Emit the new updated room list.
        io.emit('room-list', Object.keys(data));
    })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
        // Remove user from room on disconnect
        const previousRoom = utils.findRoomBySocket(roomUserMap, socket.id)
        if (previousRoom) utils.removeFromRoom(previousRoom, roomUserMap, socket, io)
    })

    // Added room-list update to room remove and room addition
    /*intervalId = setInterval(() => {
        const data = db.dataToJson()
        socket.emit('room-list', Object.keys(data));
    }, 10000)*/
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