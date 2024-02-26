// Write the data into the "database"
// which is just a JSON file
const fs = require('fs')

const dataToJson = () => {
    try {
        const data = fs.readFileSync('data.json', 'utf8');
        return JSON.parse(data)
    } catch (e) {
        console.log("Error reading file: ", e)
        return null
    }
}

const writeToFile = (obj) => {
    try {
        fs.writeFileSync('data.json', JSON.stringify(obj))
    } catch (e) {
        console.log("Error writing to file", e)
    }
}

module.exports = { dataToJson, writeToFile };