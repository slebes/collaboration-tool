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
    return (
    <>
      <TextField label={'Username'} onChange={handleChange}></TextField>
      <Button onClick={handleClick}>Okay</Button>
    </>
    )
}

export default UsernameDialog