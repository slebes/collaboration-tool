const removeFromRoom = (room, roomUserMap, socket, io) => {
    socket.leave(room)
    // Remove user from room-user Map
    const previousRoomUserlist = roomUserMap.get(room)
    const updatedPreviousRoomUserlist = previousRoomUserlist.filter(object => object.socket !== socket.id)
    roomUserMap.set(room, updatedPreviousRoomUserlist)
    // Emit this information to previous room
    io.to(room).emit("join", updatedPreviousRoomUserlist.map(object => object.username))
}

const removeFromEditSession = (fileKey, fileEditMap, socket) => {

    const sessionObject = fileEditMap.get(fileKey)
    const updatedUserList = sessionObject.users.filter(object => object.socket !== socket.id)
    const userCount = updatedUserList.length
    if (userCount <= 0) {
        fileEditMap.delete(fileKey)
    } else {
        fileEditMap.set(fileKey, {delta: sessionObject.delta, users: updatedUserList})
    } 
}

const findBySocket = (map, socketId) => { 
    for (const [key, value] of map.entries()) { 
        if (value.find(object => object.socket === socketId) !== undefined) 
            return key; 
    } 
    return undefined; 
}

module.exports = { removeFromRoom, findBySocket, removeFromEditSession }