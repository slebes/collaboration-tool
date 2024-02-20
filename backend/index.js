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

httpsServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})