import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { Container, TextField, Button, Typography, Snackbar, Alert, Paper } from '@mui/material'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const navigate = useNavigate()

  const handleReset = async (e) => {
    e.preventDefault()
    const token = params.get('token')
    try {
      const res = await axios.post('/api/reset-password', { token, new_password: newPassword })
      setSnackbar({ open: true, message: res.data.message, severity: 'success' })
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Lỗi đổi mật khẩu', severity: 'error' })
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Đặt lại mật khẩu</Typography>
        <form onSubmit={handleReset}>
          <TextField
            label="Mật khẩu mới"
            fullWidth
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="contained">Đặt lại</Button>
        </form>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
