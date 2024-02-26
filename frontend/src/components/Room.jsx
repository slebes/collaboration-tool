import { Typography, List, ListItem, ListItemText} from "@mui/material";
import { useEffect, useState } from "react";

const Room = ({socket, room}) => {
    
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on("chat message", (data) => {
            setMessages(oldData => [...oldData, JSON.parse(data).message])
          })
    }, [socket])

    return (
    <>
    <Typography variant="h1">
        {room}
    </Typography>
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