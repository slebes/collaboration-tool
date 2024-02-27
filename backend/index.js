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

const httpsServer = https.createServer({
    key: privateKey,
    cert: certificate
},
    app
)

const io = socketIO(httpsServer, {
    cors: {
        origin: "*"
    }
})

app.use(cors())

// eslint-disable-next-line no-unused-vars
let intervalId

io.on('connection', (socket) => {

    const data = db.dataToJson()
    socket.emit('room-list', data.rooms);

    socket.on('message', (msg) => {
        console.log("What am I receiving?!", msg)
        const data = JSON.parse(msg);
        if (data.room) {
            console.log("Emitting message!", data.message)
            io.to(data.room).emit("message", data.message)
            db.writeMessage(data.room, data.username, data.message)
        } else {
            io.emit('message', msg);
        }
    })

    // Maybe combine join / create-room maybe not
    socket.on('join', (roomName, cb) => {
        console.log('Joining room: ', roomName);
        console.log(socket.rooms);
        // Leave from previous room if socket was in one
        if (socket.rooms.size > 1) {
            socket.leave(Array.from(socket.rooms)[1])
        }
        socket.join(roomName);
        // Load the messages of the specific room
        const data = db.dataToJson()
        const messages = data[roomName] ? data[roomName] : []
        const room = {
            roomName,
            messages
        }
        cb(room);
    })

    socket.on('create-room', (roomName, cb) => {
        console.log('Creating room ', roomName)
        let data = db.dataToJson();
        data = { ...data, rooms: data.rooms.concat(roomName) }
        db.writeToFile(data)
        // Leave from previous room if socket was in one
        if (socket.rooms.size > 1) {
            socket.leave(Array.from(socket.rooms)[1])
        }
        socket.join(roomName);
        const room = {
            roomName: roomName
        }
        cb(room);
    })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
    })

    // Should this be cleared :D?
    intervalId = setInterval(() => {
        const data = db.dataToJson()
        io.emit('room-list', data.rooms);
    }, 10000)
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})