import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  ListItemButton,
  Grid,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import TextEditor from "./TextEditor";
import Delta from "quill-delta"

const Room = ({ socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [msgs, setMsgs] = useState([]);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [editorOnFile, setEditorOnFile] = useState(undefined);
  const elementRef = useRef(null);

  const { username, roomName } = location.state ? location.state : {};

  useEffect(() => {
    // Make sure the state is received
    if (!username || !roomName) {
      navigate("/");
      return;
    }
    socket.emit("join", { username, roomName }, (data) => {
      setMsgs(data.messages);
      setFiles(data.files);
    });
    socket.on("message", (data) => {
      const { message, username } = data;
      setMsgs((oldData) => [...oldData, { message, username }]);
    });
    socket.on("file-upload", (data) => {
      const { filename } = data;
      setFiles((oldData) => [...oldData, filename]);
    });
    socket.on("join", (data) => {
      setUsers(data);
    });
    socket.on("delete-room", () => {
      toast.error(`The room \"${roomName}\" was deleted.`);
      navigate("/lobby", { state: { username } });
    });
    return () => {
      socket.off("message");
      socket.off("file-upload");
      socket.off("join");
      socket.off("delete-room");
    };
  }, [navigate, roomName, socket, username]);

  useEffect(() => {
    elementRef?.current?.scrollIntoView();
  }, [msgs]);
  
  // Emit edit-leave when changing room mid edit
  useEffect(() => {
    if(editorOnFile && editorOnFile.roomName !== roomName) {
      console.log("leave")
      socket.emit("edit-leave", { roomName: editorOnFile.roomName, filename: editorOnFile.filename });
      setEditorOnFile(undefined);
    }
  }, [editorOnFile, roomName, socket])

  const handleSendMessage = () => {
    const data = {
      roomName: roomName,
      message: newMessage,
      username,
    };
    socket.emit("message", data);
  };

  const handlePress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
      setNewMessage("");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile !== null) {
      const data = {
        name: selectedFile.name,
        size: selectedFile.size,
        rawData: selectedFile,
      };
      // TODO: Maybe add some confiramtion for errors.
      socket.emit("file-upload", data, (data) => {
        toast.error("File upload failed.");
      });

      event.target.value = null;
    }
  };

  const handleFileLinkClick = async (e, filename) => {
    e.preventDefault();
    // https://stackoverflow.com/questions/73410132/how-to-download-a-file-using-reactjs-with-axios-in-the-frontend-and-fastapi-in-t
    if (filename.endsWith(".txt")) {
      socket.emit("edit-start", { filename, roomName }, (fileEdits) => {
        setEditorOnFile({roomName, filename: filename, initialValue: new Delta(fileEdits)});
      });
    } else {
      await downloadFile(filename);
    }
  };

  const downloadFile = async (filename) => {
    const response = await fetch(
      `https://localhost:4000/room/${roomName}/${filename}`
    );
    const blob = await response.blob();
    var url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const closeEditor = () => {
    socket.emit("edit-leave", { roomName, filename: editorOnFile.filename });
    setEditorOnFile(undefined);
  };

  return (
    <div style={{ position: "relative" }}>
      <Typography variant="h1">{roomName}</Typography>

      {editorOnFile 
      ? (
      <Box>
          <TextEditor
            initialValue={editorOnFile.initialValue}
            socket={socket}
            closeEditor={closeEditor}
            filename={editorOnFile.filename}
            downloadFile={downloadFile}
            roomName={editorOnFile.roomName}
          />
      </Box>
      )
      :<>
      <Grid container>
        <Card>
          <Typography
            variant="h6"
            sx={{
              paddingLeft: "5px",
              paddingRight: "5px",
              borderBottom: "1px solid black",
            }}
          >
            Messages:
          </Typography>
          <Box style={{ maxHeight: "80VH", height: "75VH", overflow: "auto" }}>
            <List>
              {msgs.map((message, id) => {
                return (
                  <ListItem key={message + " " + id}>
                    <ListItemText
                      primary={message.username + ": " + message.message}
                    />
                  </ListItem>
                );
              })}
            </List>
            <div className="MessagesList" ref={elementRef}></div>
          </Box>
          <TextField
            value={newMessage}
            onChange={({ target }) => setNewMessage(target.value)}
            onKeyDown={handlePress}
          />
        </Card>
        <Card sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              paddingLeft: "5px",
              paddingRight: "5px",
              borderBottom: "1px solid black",
            }}
          >
            Files:
          </Typography>
          <List style={{ maxHeight: "80VH", height: "75VH", overflow: "auto" }}>
            {files.map((filename, id) => {
              return (
                <ListItem key={filename + " " + id}>
                  <ListItemButton
                    onClick={(e) => handleFileLinkClick(e, filename)}
                  >
                    <ListItemText primary={filename} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Button variant="contained" component="label">
            Upload File <input onChange={handleFileChange} type="file" hidden />
          </Button>
        </Card>
        <Card>
          <Typography
            variant="h6"
            sx={{
              paddingLeft: "5px",
              paddingRight: "5px",
              borderBottom: "1px solid black",
            }}
          >
            Active users:
          </Typography>
          <List style={{ maxHeight: "80VH", height: "75VH", overflow: "auto" }}>
            {users.map((username, id) => {
              return (
                <ListItem key={username + " " + id}>
                  <ListItemText primary={username} />
                </ListItem>
              );
            })}
          </List>
        </Card>
      </Grid>
      </>
      }
    </div>
  );
};

export default Room;
