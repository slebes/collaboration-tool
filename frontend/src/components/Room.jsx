import { Typography, List, ListItem, ListItemText, TextField} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Room = ({socket}) => {
    const [newMessage, setNewMessage] = useState('');
    const navigate = useNavigate()
    const location = useLocation()
    
    const [msgs, setMsgs] = useState([]);

    const { username, roomName } = location.state ? location.state : {}

    useEffect(() => {
        // Make sure the state is received
        if(!username || !roomName) {
            navigate("/")
            return;
        }
        socket.emit('join', roomName, data => {
            setMsgs(data.messages);
        })
        socket.on("message", (data) => {
            console.log(data)
            const {message,username} = data
            setMsgs(oldData => [...oldData, {message,username}])
          })
    },[])
    
    const handleSendMessage = () => {
        const data = {
            roomName: roomName,
            message: newMessage,
            username
        }
        socket.emit('message', JSON.stringify(data));
    }

    const handlePress = (event) => {
        if(event.key === 'Enter') {
            console.log("Enter pressed")
            handleSendMessage()
            setNewMessage('')
        } 
    }

    return (
    <>
    <Typography variant="h1">
        {roomName}
    </Typography>
    <TextField value={newMessage} onChange={({ target}) => setNewMessage(target.value)} onKeyDown={handlePress}/>
    <List
    >
    {msgs.map((message, id) => {
            return(<ListItem key={message + " " + id}>
                <ListItemText primary={message.username + ": " + message.message}/>
            </ListItem>)
    })}
    </List>
    </>
    )
}

export default Room