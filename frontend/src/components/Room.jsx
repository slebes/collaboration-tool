import { Typography, List, ListItem, ListItemText, TextField, Button, ListItemButton} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Room = ({socket}) => {
    const [newMessage, setNewMessage] = useState('');
    const navigate = useNavigate()
    const location = useLocation()
    const [msgs, setMsgs] = useState([]);
    const [files, setFiles] = useState([])

    const { username, roomName } = location.state ? location.state : {}

    useEffect(() => {
        // Make sure the state is received
        if(!username || !roomName) {
            navigate("/")
            return;
        }
        socket.emit('join', roomName, data => {
            setMsgs(data.messages);
            setFiles(data.files)
        })
        socket.on("message", (data) => {
            const {message,username} = data
            setMsgs(oldData => [...oldData, {message,username}])
          })
        socket.on("file-upload", (data) => {
            const {filename} = data
            setFiles(oldData => [...oldData, filename])
        })
        socket.on("delete-room", () => {
            socket.off("message")
            socket.off("file-upload")
            navigate("/lobby", { state: { username }});
        })
        return () => {
            console.log("cleanup room")
            socket.off("message")
            socket.off("file-upload")
          }
    },[navigate, roomName, socket, username])

    const handleSendMessage = () => {
        const data = {
            roomName: roomName,
            message: newMessage,
            username
        }
        socket.emit('message', JSON.stringify(data));
    }

  const handlePress = (event) => {
    if (event.key === "Enter") {
      console.log("Enter pressed");
      handleSendMessage();
      setNewMessage("");
    }
  };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if(selectedFile !== null) {
                        const data = {
                name: selectedFile.name,
                size: selectedFile.size,
                rawData: selectedFile
            }
            // TODO: Maybe add some confiramtion for errors.
            socket.emit('file-upload', data)
            event.target.value = null
        }
      };

    const handleFileLinkClick = async (filename) => {
        // https://stackoverflow.com/questions/73410132/how-to-download-a-file-using-reactjs-with-axios-in-the-frontend-and-fastapi-in-t
        const response = await fetch(`https://localhost:4000/room/${roomName}/${filename}`)
        const blob = await response.blob()
        var url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    return (
    <>
    <Typography variant="h1">
        {roomName}
    </Typography>

    
    <TextField value={newMessage} onChange={({ target}) => setNewMessage(target.value)} onKeyDown={handlePress}/>
    <Button
    variant="contained"
    component="label"
    >
    Upload File
    <input
        onChange={handleFileChange}
        type="file"
        hidden
    />
    </Button>
    <List
    >
    {msgs.map((message, id) => {
            return(<ListItem key={message + " " + id}>
                <ListItemText primary={message.username + ": " + message.message}/>
            </ListItem>)
    })}
    </List>

    <List
    >
    {files.map((filename, id) => {
        return(
            <ListItem key={filename + " " + id}>
                <ListItemButton onClick={(e) => handleFileLinkClick(filename)}>
                    <ListItemText primary={filename} />
                </ListItemButton>
            </ListItem>)
    })}
    </List>
    </>
  );
};

export default Room;
