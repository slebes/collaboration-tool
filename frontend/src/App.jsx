import { useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import { Button } from '@mui/material';

const App = () => {

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = socketIO.connect("http://localhost:4000");
    newSocket.on("message", (data) => {
      console.log(data);
    })

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    }
  }, [])

  const handlePress = () => {
    socket.emit('message', JSON.stringify({ message: "Hello" }))
  }

  return (
    <>
      <h1>Hello!</h1>
      <Button onClick={handlePress}>Send Hello</Button>
    </>
  )
}

export default App
