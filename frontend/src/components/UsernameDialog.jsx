import { TextField, Button } from '@mui/material';
import {useState} from 'react'

const UsernameDialog = ({setUsername}) => {

    const [value, setValue] = useState('')
    const handleChange = (e) => {
      e.preventDefault();
      setValue(e.target.value);
    }
    const handleClick = (e) => {
        e.preventDefault();
        value !== '' && setUsername(value)
      }
    return (
    <>
      <TextField label={'Username'} onChange={handleChange}></TextField>
      <Button onClick={handleClick}>Okay</Button>
    </>
    )
}

export default UsernameDialog