const removeFromRoom = (room, roomUserMap, socket, io) => {
        socket.leave(room)
        // Remove user from room-user Map
        const previousRoomUserlist = roomUserMap.get(room)
        const updatedPreviousRoomUserlist = previousRoomUserlist.filter(object => object.socket !== socket.id)
        roomUserMap.set(room, updatedPreviousRoomUserlist)
        // Emit this information to previous room
        io.to(room).emit("join", updatedPreviousRoomUserlist.map(object => object.username))
}

const findRoomBySocket = (map, socketId) => { 
    for (const [key, value] of map.entries()) { 
        if (value.find(object => object.socket === socketId) !== undefined) 
            return key; 
    } 
    return undefined; 
} 

module.exports = { removeFromRoom, findRoomBySocket } 