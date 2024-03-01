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
import NavBar from './components/NavBar.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = socketIO.connect("https://localhost:4000");

const router = createBrowserRouter([
  {
    path: "/signup",
    element: <App/>,
  },
  {
    path: "/",
    element: <NavBar socket={socket} />,
    children: [
      {
        path: "/lobby",
        element: <Lobby socket={socket}/>,
      },
      {
        path: "/room/*",
        element: <Room socket={socket}/>
      },
    ]
  },
  {
    path: "*",
    element: <Navigate to="/signup" />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      animation="bounce"
      hideProgressBar={true}
      closeOnClick
      draggable={false}
      theme="colored"
    />
  </React.StrictMode>,
)
