import { Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import MovieDetail from './pages/MovieDetail'
import Settings from './pages/Settings'
import AdminUpload from './pages/AdminUpload'
import LandingPage from './pages/LandingPage'
// Layout
import Layout from './layouts/Layout'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/browse" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/browse/movie/:id" element={<MovieDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin/upload" element={<AdminUpload />} />
        </Route>
      </Routes>
    </>
  )
}
