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
      setRoomList(data)
    })

    return () => {
      console.log("cleanup nav")
      socket.off("room-list")
    }
  }, [location.state, navigate, socket]);

  useEffect(() => {
    socket.emit('room-list', "hello ::DDDD")
  }, [])

  const handleJoinRoom = (roomName) => {
    console.log("join room")
    navigate(`/room/${roomName}`, { state: { username, roomName }})
  }

  return (
    <>
    <Grid container gap={6} spacing={1} sx={{height: '100%' }}>
      <Grid item xs={2.5} sx={{backgroundColor: 'lightgray', padding: '30px', paddingTop: '30px !important'}}>
        <CreateRoomForm handleCreateRoom={handleJoinRoom}></CreateRoomForm>
        <RoomList roomList={roomList} handleJoinRoom={handleJoinRoom} socket={socket}></RoomList>
      </Grid>
      <Grid item xs={8.5} sx={{paddingTop: '10px !important'}}>
        <Outlet/>
      </Grid>
    </Grid>
    </>
  )

}

export default NavBar;