import { useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import { Button } from '@mui/material';

const App = () => {

  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    const newSocket = socketIO.connect("https://localhost:4000");
    newSocket.on("message", (data) => {
      console.log("Message received! " + JSON.parse(data).message);
      setRoomData(oldData => [...oldData, JSON.parse(data).message])
    })
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    }
  }, [])

  const handlePress = () => {
    socket.emit('message', JSON.stringify({ message: "Hello" }))
  }

  const handleJoinRoom = () => {
    socket.emit('join', 'test', message => {
      console.log(message)
    })
  }

  const handleJoinRoom2 = () => {
    socket.emit('join', 'test2', message => {
      console.log(message)
    })
  }

  const sendRoomMessage = () => {
    socket.emit('message', JSON.stringify({ room: 'test', message: 'This message was sent in a room!'}))
  }

  return (
    <>
      <h1>Hello!</h1>
      <Button onClick={handleJoinRoom}>JoinRoom</Button>
      <Button onClick={handleJoinRoom2}>JoinRoom2</Button>
      <Button onClick={handlePress}>Send Hello</Button>
      <Button onClick={sendRoomMessage}>Hello room</Button>
      <ul>
        {roomData.map((message,id) => {
          return(<li key={message + " " + id}>{message}</li>)
        })}
      </ul>
    </>
  )
}

export default App
