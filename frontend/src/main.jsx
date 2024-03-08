// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Lobby from "./components/Lobby.jsx";
import Room from "./components/Room.jsx";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import socketIO from "socket.io-client";
import NavBar from "./components/NavBar.jsx";
import { Toaster } from "react-hot-toast";

const socket = socketIO.connect("https://localhost:4000");

const router = createBrowserRouter([
  {
    path: "/signup",
    element: <App />,
  },
  {
    path: "/app",
    element: <NavBar socket={socket} />,
    children: [
      {
        path: "/app/lobby",
        element: <Lobby socket={socket} />,
      },
      {
        path: "/app/room/*",
        element: <Room socket={socket} />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/signup" />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-left" />
  </React.StrictMode>
);
