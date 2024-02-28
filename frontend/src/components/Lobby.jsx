import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'
import { useNavigate, useLocation } from "react-router-dom";

const Lobby = ({ socket }) => {
  const [roomList, setRoomList] = useState([]);
  console.log(roomList);

  // GET USERNAME FROM INNER STATE!
  const location = useLocation()
  const navigate = useNavigate()

  const username = location.state?.username

  useEffect(() => {
    
    if(!location.state) {
      navigate("/signup")
      return;
    }

  }, [location.state, navigate, socket])
  
  return (
    <>
      <Typography variant="h1">
          Hello {username}! This is the frontpage.
      </Typography>
    </>
  );
};

export default Lobby;
