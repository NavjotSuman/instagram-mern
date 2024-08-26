
import './App.css'
import SignUp from './components/SignUp'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Home from './components/Home'

function App() {

  const routes = createBrowserRouter(
    createRoutesFromElements([
      <Route path="/" element=<MainLayout />>
        <Route path="" element=<Home /> />
        <Route path="/profile" element=<Profile /> />
      </Route>,
      <Route path="/login" element=<Login /> />,
      <Route path="/signup" element=<SignUp /> />
    ])
  );

  return (
    <>
    <RouterProvider router={routes} />
    </>
  )
}

export default App
