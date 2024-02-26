import { List, ListItemButton ,ListItem, ListItemText, Typography } from '@mui/material';

const RoomList = ({roomList, handleJoinRoom}) => {
  
  return (
    <>
    <Typography variant="h3">
      Rooms:
    </Typography>
    <List>
    {roomList.map((roomName, id) => {
        return(<ListItem key={roomName + " " + id}>
            <ListItemButton onClick={() => handleJoinRoom(roomName)}>
              <ListItemText primary={roomName}/>
            </ListItemButton>
        </ListItem>)
    })}
    </List>
    </>
  )}

  export default RoomList