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
    return (
    <>
      <TextField label={'Create room'} onChange={handleChange}>Username:</TextField>
      <Button onClick={handleClick}>Create</Button>
    </>
    )
}

export default CreateRoomForm