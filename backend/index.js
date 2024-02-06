const express = require('express')
const socketIO = require('socket.io')
const cors = require('cors')
const app = express()
const port = 4000

const http = require('http').Server(app)

const io = socketIO(http, {
    cors: {
        origin: "*"
    }
});

app.use(cors())

io.on('connection', (socket) => {

    socket.on('message', (msg) => {
        console.log('message: ' + msg)
        io.emit('message', msg);
    })

    socket.on('disconnect', () => {
        console.log("A client has disconnected")
    })
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

http.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})