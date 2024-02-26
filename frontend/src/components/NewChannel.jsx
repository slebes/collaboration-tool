/* eslint-disable react/prop-types */
import { Button, TextField } from "@mui/material";
import { useState } from "react";

const NewChannel = ({ socket }) => {
    const [room, setRoom] = useState('')

    const handleCreate = () => {
        socket.emit('create-channel', room)

    }
    return (
        <>
            <TextField onChange={({ target }) => setRoom(target.value)} />
            <Button onClick={handleCreate}>Create channel</Button>
        </>
    )
}

export default NewChannel