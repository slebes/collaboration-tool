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
const fileEditMap = new Map()
const pingMap = new Map()

io.on('connection', (socket) => {
    const data = db.dataToJson()
    socket.on('room-list', () => {
        const roomListObject = {
            rooms: Object.keys(data)
        }
        socket.emit('room-list', roomListObject);
    })

    socket.on('file-upload', ({ name, size, rawData }, cb) => {
        const [, currentRoom] = socket.rooms
        try {
            const savedFilename = db.saveFile(currentRoom, name, size, rawData)
            io.to(currentRoom).emit('file-upload', { roomName: currentRoom, filename: savedFilename })
        } catch (e) {
            console.log(e)
            cb("Error saving file")
        }
    })

    socket.on('message', (data) => {
        if (data.roomName) {
            io.to(data.roomName).emit("message", data)
            db.writeMessage(data.roomName, data.username, data.message)
        }
    })

    socket.on('join', ({ username, roomName }, cb) => {
        let data = db.dataToJson();
        if (!(roomName in data)) {
            data[roomName] = { messages: [], files: [] }
            db.writeToFile(data)
            const roomListObject = {
                rooms: Object.keys(data)
            }
            socket.emit('room-list', roomListObject);
            roomUserMap.set(roomName, [])
        }
        if (socket.rooms.size > 1) utils.removeFromRoom(Array.from(socket.rooms)[1], roomUserMap, socket, io)
        socket.join(roomName);

        // Emit userList when user joins
        const updatedUserlist = [...roomUserMap.get(roomName), { socket: socket.id, username }]
        roomUserMap.set(roomName, updatedUserlist)

        const userListObject = {
            users: updatedUserlist.map(object => object.username)
        }

        io.to(roomName).emit("join", userListObject)
        console.log(data[roomName])

        cb(data[roomName]);
    })

    socket.on('delete-room', ({ roomName }) => {

        let data = db.dataToJson()
        delete data[roomName]
        db.writeToFile(data)
        db.deleteRoomData(roomName)
        // Remove ongoing edit sessions
        fileEditMap.forEach((value, key) => {
            if (key.startsWith(`${roomName}-`)) {
                fileEditMap.delete(key)
            }
        })
        // Signal to everyone that the room has been deleted
        // Kick them out (do it on the frontend side)
        io.to(roomName).emit('delete-room')
        io.in(roomName).socketsLeave(roomName);
        roomUserMap.delete(roomName)
        // Emit the new updated room list.
        const roomListObject = {
            rooms: Object.keys(data)
        }
        socket.emit('room-list', roomListObject);
    })

    socket.on('edit-start', ({ roomName, filename, username }, cb) => {
        try {
            const fileKey = `${roomName}-${filename}`
            if (fileEditMap.has(fileKey)) {
                const oldEdit = fileEditMap.get(fileKey)
                const newEdit = { delta: oldEdit.delta, users: [...oldEdit.users, { socket: socket.id, username: username }] }
                fileEditMap.set(fileKey, newEdit);
                cb(newEdit.delta);
            } else {
                const data = fs.readFileSync(`./data/${roomName}/${filename}`)
                const fileEdits = new Delta([{ "insert": data.toString() }])
                fileEditMap.set(fileKey, { delta: fileEdits, users: [{ socket: socket.id, username: username }] })
                cb(fileEdits)
            }
        } catch (e) {
            console.log("Failed to create a MAP")
        }
    })

    socket.on('edit', ({ roomName, filename, delta }) => {
        const fileKey = `${roomName}-${filename}`
        const old = fileEditMap.get(fileKey)
        if (old) {
            const newDelta = old.delta.compose(delta)
            fileEditMap.set(fileKey, { delta: newDelta, users: old.users });
            socket.broadcast.to(roomName).emit(`edit-${filename}`, delta);
        } else {
            console.log("Error editing file. No delta exists for file!");
        }
    })

    socket.on('edit-save', ({ roomName, filename, value }) => {
        const fileDest = `./data/${roomName}/${filename}`
        fs.writeFileSync(fileDest, value)
    })

    socket.on('edit-leave', ({ roomName, filename }) => {
        const fileKey = `${roomName}-${filename}`
        const session = fileEditMap.get(fileKey);
        if (session) {
            const userCount = session.users.length - 1
            if (userCount <= 0) {
                fileEditMap.delete(fileKey)
            } else {
                const updatedUserList = session.users.filter(user => user.socket !== socket.id)
                fileEditMap.set(fileKey, { delta: session.delta, users: updatedUserList });
            }
        }
    })

    socket.on('throughput-upload', ({ rawData }, cb) => {
        cb()
    })

    socket.on('ping', ({ prevPing, username }, cb) => {
        cb()
        pingMap.set(socket.id, {username: username, ping: prevPing});
    })

    socket.on("ask-ping", ({roomName}, cb) => {
        const myPing = pingMap.get(socket.id)
        const roomPings = roomUserMap.get(roomName).map((userobj) => {
            if(userobj.socket !== socket.id) {
                const data = pingMap.get(userobj.socket)
                return (
                    {username: data.username, ping:(data.ping+myPing.ping)}
                )
            }
        }).filter(u => u)
        cb({roomPings})
    })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
        // Remove user from room and edit sessions on disconnect
        const previousRoom = utils.findBySocket(roomUserMap, socket.id)
        const fileEditUserMap = new Map(Array.from(fileEditMap, ([key, value]) => [key, value.users]))
        const fileKey = utils.findBySocket(fileEditUserMap, socket.id)
        if (previousRoom) utils.removeFromRoom(previousRoom, roomUserMap, socket, io)
        if (fileKey) utils.removeFromEditSession(fileKey, fileEditMap, socket)
        pingMap.delete(socket.id)
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
            ? res.sendFile(file, { root: "./data" })
            : res.status(404)
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

app.get('/test-download', (req, res) => {
    // Send 1MB junk data to calculate download speed
    // eslint-disable-next-line no-undef
    const rawData = Buffer.alloc(1024 * 1024)
    res.send(rawData)
})

httpsServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})