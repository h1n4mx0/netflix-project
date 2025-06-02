import axios from 'axios'
import toast from 'react-hot-toast'

const instance = axios.create({
  baseURL: '/api',
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', {
        duration: 3000
      })
      localStorage.removeItem('token')
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    }
    return Promise.reject(err)
  }
)

export default instance
