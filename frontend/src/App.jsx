
import './App.css'
import SignUp from './components/SignUp'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Home from './components/Home'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import { io } from 'socket.io-client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './components/redux/socketSlice'
import { setOnlineUsers } from './components/redux/chatSlice'
import { setLikeNotification } from './components/redux/notificationSlice'

function App() {

  const routes = createBrowserRouter(
    createRoutesFromElements([
      <Route path="/" element=<MainLayout />>
        <Route path="" element=<Home /> />
        <Route path="/profile/:username" element=<Profile /> />
        <Route path="/profile/edit" element=<EditProfile /> />
        <Route path="/chat" element=<ChatPage /> />
      </Route>,
      <Route path="/login" element=<Login /> />,
      <Route path="/signup" element=<SignUp /> />
    ])
  );

  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:4000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      dispatch(setSocket(socketio));

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);
  return (
    
    <>
    <RouterProvider router={routes} />
    </>
  )
}

export default App
