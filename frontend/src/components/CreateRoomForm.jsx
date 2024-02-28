import { TextField, Button } from "@mui/material";
import { useState } from 'react'

const CreateRoomForm = ({handleCreateRoom}) => {
    const [value, setValue] = useState('')
    
    const handleChange = (e) => {
      e.preventDefault();
      setValue(e.target.value);
    }
    const handleClick = (e) => {
        e.preventDefault();
        value && value !== '' && handleCreateRoom(value)
    }
    
    const handlePress = (event) => {
      if(event.key === 'Enter') {
          console.log("Enter pressed")
          handleClick()
      } 
    }
    return (
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
      <TextField label={'Create room'} onChange={handleChange} onKeyDown={handlePress}>Username:</TextField>
      <Button onClick={handleClick}>Create</Button>
    </div>
    )
}

export default CreateRoomForm