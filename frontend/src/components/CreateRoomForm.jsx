import { TextField, Button, Typography } from "@mui/material";
import { useState } from 'react'

const CreateRoomForm = ({handleCreateRoom}) => {
    const [value, setValue] = useState('')
    
    const handleChange = (e) => {
      e.preventDefault();
      setValue(e.target.value);
    }
    const handleClick = (e) => {
        e.preventDefault();
        const newRoom = value;
        setValue('')
        newRoom && newRoom !== '' && handleCreateRoom(newRoom)
    }
    
    const handlePress = (event) => {
      if(event.key === 'Enter') {
          const newRoom = value;
          setValue('');
          newRoom && newRoom !== '' && handleCreateRoom(newRoom)
      } 
    }
    return (
    <>
      <Typography variant="h3">Create Room:</Typography>
      <div style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
        <TextField label={'Create room'} value={value} onChange={handleChange} onKeyDown={handlePress}>Username:</TextField>
        <Button onClick={handleClick}>Create</Button>
      </div>
    </>
    )
}

export default CreateRoomForm