import { useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import CreateRoomForm from './CreateRoomForm'
import Room from './Room'
import RoomList from './RoomList';
import { Typography } from '@mui/material'

const Lobby = ({username}) => {

  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState();
  const [roomList, setRoomList] = useState([]);

  useEffect(() => {
    const newSocket = socketIO.connect("https://localhost:4000");
    newSocket.on("message", (data) => {
      console.log("Message received! " + JSON.parse(data).message);
    })
    newSocket.on('room-list', (data) => {
      setRoomList(data)
    })
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    }
  }, [])

  const handleCreateRoom = (roomName) => {
    socket.emit('create-room', roomName, data => {
      setRoom(data.roomName)
    })
  }

  const handleJoinRoom = (roomName) => {
    socket.emit('join', roomName, data => {
      console.log(data)
      setRoom(data.roomName)
    })
  }
  
  return (
    <>{
      !room 
      ? <>
          <Typography variant="h1">
              Hello! {username}
          </Typography>
          <RoomList roomList={roomList} handleJoinRoom={handleJoinRoom}></RoomList>
          <CreateRoomForm handleCreateRoom={handleCreateRoom}></CreateRoomForm>
        </>
      :<Room socket={socket} room={room}></Room>
    }
    </>
  )}

  export default Lobby