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
            <ListItemButton
              onClick={() => handleJoinRoom(roomName)}
              sx={{boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", textAlign: 'center'}}
            >
              <ListItemText primary={roomName}/>
            </ListItemButton>
        </ListItem>)
    })}
    </List>
    </>
  )}

  export default RoomList