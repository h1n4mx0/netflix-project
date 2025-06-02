import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'


export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/register', {
        name, email, password, phone, birthdate
      })

      setSnackbar({
        open: true,
        message: 'Đăng ký thành công! Mời bạn đăng nhập.',
        severity: 'success'
      })

      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const msg = err.response?.data?.error || 'Đăng ký thất bại'
      setSnackbar({ open: true, message: msg, severity: 'error' })
    }
  }


  return (
    <div className="w-full h-screen bg-black flex items-center justify-center text-white">
      <div className="bg-[#141414] px-8 py-10 rounded-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6">Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 bg-[#333] rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 bg-[#333] rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 bg-[#333] rounded"
            required
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 bg-[#333] rounded"
            required
          />
          <input
            type="date"
            placeholder="Birthdate"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            className="w-full p-3 bg-[#333] rounded"
            required
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-semibold cursor-pointer transition-colors">
            Sign Up
          </button>
        </form>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <p className="text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-white hover:underline cursor-pointer">
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}
