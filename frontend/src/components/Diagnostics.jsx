import { useEffect, useState } from "react";
import { Typography } from "@mui/material";



const Diagnostics = ({socket}) => {

  const [ping, setPing] = useState(0);

  const pingServer = () => {
    const start = Date.now();
  
    socket.emit("ping", () => {
      const duration = Date.now() - start;
      setPing(duration);
    });
  }
  useEffect(() => {
    setInterval(() => {
      pingServer()
    }, 2000);
  }, [])

  return (
    <Typography variant="p">Ping: {ping}ms</Typography>
  )
}

export default Diagnostics;