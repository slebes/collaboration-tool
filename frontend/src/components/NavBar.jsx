import { useEffect, useState } from 'react'
import CreateRoomForm from './CreateRoomForm'
import RoomList from './RoomList';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Grid } from '@mui/material';

const NavBar = ({socket}) => {

  const [roomList, setRoomList] = useState([]);

  const location = useLocation()
  const navigate = useNavigate()

  const username = location.state?.username

  useEffect(() => {
    
    if(!location.state) {
      navigate("/signup")
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
  }, [location.state, navigate, socket])

  const handleJoinRoom = (roomName) => {
    console.log("join room")
    navigate(`/room/${roomName}`, { state: { username, roomName }})
  }

  return (
    <>
    <Grid container gap={6} spacing={1} sx={{height: '100%' }}>
      <Grid item xs={2.5} sx={{backgroundColor: 'lightgray', padding: '30px'}}>
        <CreateRoomForm handleCreateRoom={handleJoinRoom}></CreateRoomForm>
        <RoomList roomList={roomList} handleJoinRoom={handleJoinRoom} socket={socket}></RoomList>
      </Grid>
      <Grid item xs={8.5}>
        <Outlet />
      </Grid>
    </Grid>
    </>
  )

}

export default NavBar;