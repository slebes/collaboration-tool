import { useEffect, useState } from 'react'
import CreateRoomForm from './CreateRoomForm'
import Room from './Room'
import RoomList from './RoomList';
import { Typography } from '@mui/material'
import { useNavigate, useLocation } from "react-router-dom";

const Lobby = ({socket}) => {

  const [roomList, setRoomList] = useState([]);
  console.log(roomList);

  // GET USERNAME FROM INNER STATE!
  const location = useLocation()
  const navigate = useNavigate()
  
  const username = location.state?.username

  useEffect(() => {
    
    if(!location.state) {
      navigate("/")
      return;
    }

    socket.on('room-list', (data) => {
      console.log("fetching room list: " + data)
      setRoomList(data)
    })

    socket.emit('room-list', "hello ::DDDD")
    return () => {
      console.log("cleanup")
      socket.off("room-list")
    }
  }, [])

  const handleJoinRoom = (roomName) => {
    console.log("join room")
    navigate(`/room/${roomName}`, { state: { username, roomName }})
  }
  
  return (
    <>
      <Typography variant="h1">
          Hello! {username}
      </Typography>
      <RoomList roomList={roomList} handleJoinRoom={handleJoinRoom}></RoomList>
      <CreateRoomForm handleCreateRoom={handleJoinRoom}></CreateRoomForm>
    </>
  )}

  export default Lobby