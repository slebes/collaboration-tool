const fs = require('fs')
const https = require ('https')
const express = require('express')
const socketIO = require('socket.io')
const cors = require('cors')
const app = express()
const port = 4000
const privateKey  = fs.readFileSync('key.pem', 'utf8')
const certificate = fs.readFileSync('cert.pem', 'utf8')

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

io.on('connection', (socket) => {

    socket.on('message', (msg) => {
        const data = JSON.parse(msg);
        console.log('message: ' + data)
        if(data.room){
            console.log("What is the room?", data.room)
            io.to(data.room).emit("message", msg)
        } else {
            io.emit('message', msg);
        }
    })


    socket.on('join', (room, cb) => {
        console.log('joining room: ' + room);
        console.log(socket.rooms);
        // Leave from previous room if socket was in one
        if(socket.rooms.size > 1) {
            socket.leave(Array.from(socket.rooms)[1])
        }
        socket.join(room);
        cb('Joined room ' + room);
    })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
    })
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

httpsServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})