// Write the data into the "database"
// which is just a JSON file
const fs = require('fs')

const dataToJson = () => {
    try {
        const data = fs.readFileSync('./data/data.json', 'utf8');
        return JSON.parse(data)
    } catch (e) {
        console.log("Error reading file: ", e)
        return null
    }
}

const writeToFile = (obj) => {
    try {
        fs.writeFileSync('./data/data.json', JSON.stringify(obj))
    } catch (e) {
        console.log("Error writing to file", e)
    }
}

const writeMessage = (room, username, message) => {
    let data = dataToJson()
    const newMessage = { username, message }
    if (!data[room]) {
        data[room] = {messages: []};
    }
    data[room].messages.push(newMessage)

    writeToFile(data)
}

const saveFile = (roomName, filename, size, rawData) => {
    const data = dataToJson()
    if (!(roomName in data)) throw new Error("Unknown room name")
    // Scuffed file copy name checker
    if (!fs.existsSync(`./data/${roomName}`)) fs.mkdirSync(`./data/${roomName}`)
    let fileWriteName = filename
    for (var i = 0; i < Infinity; i++) {
        if (i === 0){
            if (!fs.existsSync(`./data/${roomName}/${filename}`)) {
                break
            }
        } else {
            const index = filename.lastIndexOf(".")
            const firstPart = filename.slice(0, index)
            const secondPart = filename.slice(index)
            const copyName = `${firstPart} (${i})${secondPart}`                    
            if (!fs.existsSync(`./data/${roomName}/${copyName}`)) {
                fileWriteName = copyName
                break
            }
        }
    }
    fs.writeFileSync(`./data/${roomName}/${fileWriteName}`, rawData)
    data[roomName].files.push(fileWriteName)
    writeToFile(data)
    return fileWriteName
}

const getFile = (roomName, filename) => {
    return fs.existsSync(`./data/${roomName}/${filename}`) 
    ? `${roomName}/${filename}`
    : ""
}

const deleteRoomData = (roomName) => {
    try {
        fs.rmSync(`./data/${roomName}`, { recursive: true, force: true });
    } catch (e) {
        console.log("Failed to delete room data\n ", e)
    }
}

module.exports = { dataToJson, writeToFile, writeMessage, saveFile, getFile, deleteRoomData };