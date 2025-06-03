import { useState } from 'react'
import axios from 'axios'
import { Box, Container, TextField, Button, Typography, Snackbar, Alert, Paper } from '@mui/material'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/forgot-password', { email })
      setSnackbar({ open: true, message: res.data.message, severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Lỗi gửi email', severity: 'error' })
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Quên mật khẩu</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="contained">Gửi liên kết khôi phục</Button>
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