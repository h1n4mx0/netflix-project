import { Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MoviePage from './pages/MoviePage'
import MovieDetail from './pages/MovieDetail'
import ShowPage from './pages/ShowPage'
import ShowDetail from './pages/ShowDetail'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import AdminUpload from './pages/AdminUpload'
import LandingPage from './pages/LandingPage'
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SearchResults from './pages/SearchResults'
import Faq from './pages/Faq'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import WatchShow from './pages/WatchShow'
// import WatchMovie from './pages/WatchMovie'
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
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/faq" element={<Layout />}>
          <Route index element={<Faq />} />
        </Route>
        <Route path="/contact" element={<Layout />}>
          <Route index element={<Contact />} />
        </Route>
        <Route path="/terms" element={<Layout />}>
          <Route index element={<Terms />} />
        </Route>
        <Route path="/privacy" element={<Layout />}>
          <Route index element={<Privacy />} />
        </Route>
        
        {/* Protected routes */}
        <Route path="/browse" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="shows" element={<ShowPage />} />
          <Route path="shows/:id" element={<ShowDetail />} />
          <Route path="shows/:showId/watch/:episodeId" element={<WatchShow />} />
          <Route path="movies" element={<MoviePage />} />
          <Route path="movie/:id" element={<MovieDetail />} />
          {/* <Route path="movies/:id/watch" element={<WatchMovie />} /> */}
          <Route path="search" element={<SearchResults />} />
          <Route path="admin/upload" element={<AdminUpload />} />
        </Route>
        <Route path="/user" element={<Layout />}>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}
