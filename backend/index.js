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
    socket.on('room-list', (msg) => {
        socket.emit('room-list', Object.keys(data));
    })

    socket.on('message', (msg) => {
        console.log("What am I receiving?!", msg)
        const data = JSON.parse(msg);
        if (data.roomName) {
            console.log("Emitting message!", data.message)
            io.to(data.roomName).emit("message", data)
            db.writeMessage(data.roomName, data.username, data.message)
        } else {
            io.emit('message', msg);
        }
    })

    socket.on('join', (roomName, cb) => {
        let data = db.dataToJson();
        if (!(roomName in data)) {
            console.log('Creating room ', roomName)
            data[roomName] = {messages: []}
            db.writeToFile(data)
        }

        console.log('Joining room: ', roomName);
        // Leave from previous room if socket was in one
        if (socket.rooms.size > 1) {
            socket.leave(Array.from(socket.rooms)[1])
        }
        socket.join(roomName);
        // Load the messages of the specific room
        const room = {
            roomName: roomName,
            ...data[roomName]
        };
        cb(room);
    })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
    })

    // Should this be cleared :D?
    intervalId = setInterval(() => {
        const data = db.dataToJson()
        socket.emit('room-list', Object.keys(data));
    }, 10000)
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})