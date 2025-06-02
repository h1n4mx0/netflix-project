import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Container,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  Box,
  Paper
} from '@mui/material'

export default function Verify() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading')
  const [resendEmail, setResendEmail] = useState('')
  const [showResendForm, setShowResendForm] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  let didRun = false

  useEffect(() => {

    const verify = async () => {
      if (didRun) return
      didRun = true

      const token = params.get('token')
      if (!token) {
        setStatus('error')
        return
      }

      try {
        await axios.get(`/api/verify?token=${token}`)
        setStatus('success')
        setTimeout(() => navigate('/login'), 3000)
      } catch (err) {
        console.log(err)
        setStatus('error')
      }
    }

    verify()
    return () => { didRun = true }
  }, [params, navigate])

  const handleResend = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/resend-verification', { email: resendEmail })
      setSnackbar({ open: true, message: res.data.message, severity: 'success' })
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Lỗi gửi lại',
        severity: 'error'
      })
    }
  }

  return (
    <div className="relative w-full min-h-screen">
    {/* Background ảnh Netflix */}
    <div
        className="absolute inset-0 bg-cover bg-center brightness-[.4] z-0"
        style={{
        backgroundImage: "url('/images/netflix-cover.jpg')"
        }}
    />

    {/* Foreground nội dung */}
    <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={4} sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(30,30,30,0.95)',
            color: 'white'
        }}>
            {status === 'loading' && (
            <Typography variant="h6">🔄 Đang xác minh tài khoản...</Typography>
            )}

            {status === 'success' && (
            <>
                <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
                Tài khoản đã được xác minh!
                </Typography>
                <Typography variant="body1">Đang chuyển về trang đăng nhập...</Typography>
            </>
            )}

            {status === 'error' && (
            <>
                <Alert severity="error" sx={{ mb: 3 }}>
                Token không hợp lệ hoặc đã hết hạn.
                </Alert>
                <Button
                variant="contained"
                color="error"
                onClick={() => setShowResendForm(true)}
                sx={{ mb: 2 }}
                >
                Gửi lại email xác minh
                </Button>

                {showResendForm && (
                <Box component="form" onSubmit={handleResend} sx={{ mt: 2 }}>
                    <TextField
                    label="Email"
                    variant="filled"
                    fullWidth
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        style: { backgroundColor: '#2e2e2e', color: 'white' }
                    }}
                    InputLabelProps={{
                        style: { color: '#aaa' }
                    }}
                    />
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    >
                    Gửi lại
                    </Button>
                </Box>
                )}
            </>
            )}
        </Paper>
        </Box>

        <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
        <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%' }}
        >
            {snackbar.message}
        </Alert>
        </Snackbar>
    </Container>
    </div>

  )
}
