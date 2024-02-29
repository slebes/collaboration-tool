import { TextField, Button } from '@mui/material';
import {useState} from 'react'
import { useNavigate } from "react-router-dom";

const UsernameDialog = () => {

    const [value, setValue] = useState('')
    const navigate = useNavigate()
    const handleChange = (e) => {
      e.preventDefault();
      setValue(e.target.value);
    }
    const handleClick = (e) => {
        e.preventDefault();
        // Change site to "Lobby"
        navigate("/lobby", { state: { username: value }})
    }

    const handlePress = (event) => {
      if(event.key === 'Enter') {
          console.log("Enter pressed")
          navigate("/lobby", { state: { username: value }})
      } 
    }

    return (
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
      <TextField label={'Username'} onChange={handleChange} onKeyDown={handlePress}></TextField>
      <Button onClick={handleClick}>Okay</Button>
    </div>
    )
}

export default UsernameDialog