import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Lobby from './components/Lobby.jsx'
import Room from './components/Room.jsx';
import './index.css'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import socketIO from 'socket.io-client';

const socket = socketIO.connect("https://localhost:4000");

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/lobby",
    element: <Lobby socket={socket}/>,
  },
  {
    path: "/room/*",
    element: <Room socket={socket}/>
  },
  {
    path: "*",
    element: <Navigate to="/" />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
