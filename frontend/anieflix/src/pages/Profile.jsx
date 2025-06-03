import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Divider,
} from '@mui/material'

export default function ProfilePage() {
  const [tab, setTab] = useState(0)
  const [profile, setProfile] = useState({ name: '', email: '', birthdate: '', phone: '' })
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setProfile(res.data)
      } catch (err) {
        console.error('[❌ profile]', err)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async () => {
    try {
      await axios.put('/api/profile', profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' })
    } catch (err) {
      const msg = err.response?.data?.error || 'Cập nhật thất bại'
      setSnackbar({ open: true, message: msg, severity: 'error' })
    }
  }

  const handlePasswordChange = async () => {
    try {
      await axios.post('/api/change-password', passwords, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSnackbar({ open: true, message: 'Đổi mật khẩu thành công', severity: 'success' })
      setPasswords({ old_password: '', new_password: '' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Đổi mật khẩu thất bại', severity: 'error' })
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'black' }}>

        <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: '#1e1e1e', color: 'white' }}>
            <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            variant="fullWidth"
            textColor="inherit"
            indicatorColor="primary"
            >
            <Tab label="Thông tin cá nhân" />
            <Tab label="Đổi mật khẩu" />
            </Tabs>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

            {tab === 0 && (
            <Box>
                <Typography variant="h6" gutterBottom>Thông tin tài khoản</Typography>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                    label="Tên hiển thị"
                    fullWidth
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    variant="filled"
                    InputProps={{ style: { backgroundColor: '#2e2e2e', color: 'white' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    label="Email"
                    fullWidth
                    value={profile.email}
                    disabled
                    variant="filled"
                    InputProps={{ style: { backgroundColor: '#2e2e2e', color: 'gray' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    label="Số điện thoại"
                    fullWidth
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    variant="filled"
                    InputProps={{ style: { backgroundColor: '#2e2e2e', color: 'white' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    label="Ngày sinh"
                    fullWidth
                    type="date"
                    value={profile.birthdate?.split('T')[0] || ''}
                    onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                    variant="filled"
                    InputLabelProps={{ shrink: true, style: { color: '#aaa' } }}
                    InputProps={{ style: { backgroundColor: '#2e2e2e', color: 'white' } }}
                    />
                </Grid>
                </Grid>
                <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleUpdate}>
                Lưu thay đổi
                </Button>
            </Box>
            )}

            {tab === 1 && (
            <Box>
                <Typography variant="h6" gutterBottom>Đổi mật khẩu</Typography>
                <TextField
                label="Mật khẩu hiện tại"
                fullWidth
                type="password"
                value={passwords.old_password}
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                sx={{ mb: 2 }}
                variant="filled"
                InputProps={{ style: { backgroundColor: '#2e2e2e', color: 'white' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <TextField
                label="Mật khẩu mới"
                fullWidth
                type="password"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                sx={{ mb: 2 }}
                variant="filled"
                InputProps={{ style: { backgroundColor: '#2e2e2e', color: 'white' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
                />
                <Button variant="contained" fullWidth color="primary" onClick={handlePasswordChange}>
                Đổi mật khẩu
                </Button>
            </Box>
            )}
        </Paper>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            >
            {snackbar.message}
            </Alert>
        </Snackbar>
        </Container>
    </Box>
  )
}
