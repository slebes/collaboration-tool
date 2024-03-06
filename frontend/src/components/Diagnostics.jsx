import { useEffect, useState } from "react";
import { Button, Typography, Grid, Card } from "@mui/material";

const Diagnostics = ({socket}) => {

  const [ping, setPing] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);

  const pingServer = () => {
    const start = Date.now();
  
    socket.emit("ping", () => {
      const duration = Date.now() - start;
      setPing(duration);
    });
  }

  const testUploadThroughput = () => {
    // Upload 1MB junk data to calculate upload speed
    const dataSize = 8 * 1024 * 1024
    const rawData = new Blob([new ArrayBuffer(dataSize)], {type: 'application/octet-stream'})

    const start = Date.now()
    socket.emit("throughput-upload", {rawData}, (end) => {
      const uploadTimeSeconds = (end - start)  / 1000
      const uploadSpeed = (1 / uploadTimeSeconds).toFixed(2)
      setUploadSpeed(uploadSpeed)
    })
  }

  const testDownloadThroughput =  async () => {
    const start = Date.now()
    const response = await fetch(
      `https://localhost:4000/test-download`
    );
    const end = Date.now()
    console.log("Downloaded:", response)
    const downloadTimeSeconds = (end- start) / 1000
    const downloadSpeed = (1 / downloadTimeSeconds).toFixed(2)
    setDownloadSpeed(downloadSpeed)
  }

  useEffect(() => {
    setInterval(() => {
      pingServer()
    }, 2000);
  }, [])

  return (
    <Card style={{maxHeight: "150px", maxWidth: "250px"}}>
      <Typography variant="h6">Diagnostics</Typography>
      <Grid justifyContent="center" alignItems="center" container spacing={1}>
        <Grid item xs={8} >
          <Typography variant="p">Ping:</Typography>
        </Grid> 
        <Grid item xs={4}>
          <Typography variant="p">{ping}ms</Typography>
        </Grid> 
        <Grid item xs={8}>
          <Button onClick={testUploadThroughput}>Test upload</Button>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="p">{uploadSpeed}MB/s</Typography>
        </Grid>
        <Grid item xs={8}>
          <Button onClick={testDownloadThroughput}>Test download</Button>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="p">{downloadSpeed}MB/s</Typography>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Diagnostics;