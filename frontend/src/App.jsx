import {useState } from 'react'
import UserNameDialog from './components/UsernameDialog'
import Lobby from './components/Lobby'

const App = () => {

  const [username, setUsername] = useState();

  return (
    <>
    {
      !username 
      ? <UserNameDialog setUsername={setUsername}></UserNameDialog>
      : <Lobby username={username}></Lobby>
    }
    </>
  )
}

export default App
