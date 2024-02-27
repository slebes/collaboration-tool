import { Typography, List, ListItem, ListItemText, TextField} from "@mui/material";
import { useEffect, useState } from "react";

const Room = ({socket, room, username}) => {
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        socket.on("chat message", (data) => {
            setMessages(oldData => [...oldData, JSON.parse(data).message])
          })
    }, [socket])

    const handleSendMessage = () => {
        const data = {
            room,
            message: newMessage,
            username
        }
        console.log("What am I sending?", data)
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
        {room}
    </Typography>
    <TextField value={newMessage} onChange={({ target}) => setNewMessage(target.value)} onKeyDown={handlePress}/>
    <List
    >
    {messages.map((message, id) => {
            return(<ListItem key={message + " " + id}>
                <ListItemText primary={message}/>
            </ListItem>)
    })}
    </List>
    </>
    )
}

export default Room