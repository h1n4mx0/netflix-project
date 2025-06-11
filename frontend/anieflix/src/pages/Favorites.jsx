import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axios'
import { Heart, Play, Star, Calendar, Clock, Trash2, Search } from 'lucide-react'
import { Snackbar, Alert } from '@mui/material'

export default function Favorites() {
  const [favoriteMovies, setFavoriteMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      
      // Lấy danh sách yêu thích
      const favoritesRes = await axios.get('/favorites')
      const favorites = favoritesRes.data.favorites || []
      
      if (favorites.length === 0) {
        setFavoriteMovies([])
        return
      }

      // Lấy thông tin chi tiết từng item
      const itemPromises = favorites.map(favorite => {
        const endpoint = favorite.item_type === 'show' 
          ? `/shows/${favorite.item_id}` 
          : `/movies/${favorite.item_id}`
          
        return axios.get(endpoint).then(res => ({
          ...res.data,
          item_type: favorite.item_type,
          addedToFavorites: favorite.created_at || new Date()
        })).catch(err => {
          console.error(`Error fetching ${favorite.item_type} ${favorite.item_id}:`, err)
          return null
        })
      })
      
      const itemResponses = await Promise.all(itemPromises)
      const items = itemResponses.filter(res => res !== null)
      
      setFavoriteMovies(items)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      if (error.response?.status === 401) {
        setToast({ 
          open: true, 
          message: 'Bạn cần đăng nhập để xem danh sách yêu thích', 
          severity: 'warning' 
        })
      } else {
        setToast({ 
          open: true, 
          message: 'Có lỗi xảy ra khi tải danh sách yêu thích', 
          severity: 'error' 
        })
      }
    } finally {
      setLoading(false)
    }
    }

  const removeFavorite = async (movieId) => {
    try {
      await axios.delete(`/favorites/${movieId}`)
      setFavoriteMovies(prev => prev.filter(movie => movie.id !== movieId))
      setToast({ 
        open: true, 
        message: 'Đã xóa khỏi danh sách yêu thích', 
        severity: 'success' 
      })
    } catch (error) {
      console.error('Error removing favorite:', error)
      setToast({ 
        open: true, 
        message: 'Có lỗi xảy ra khi xóa phim', 
        severity: 'error' 
      })
    }
  }

  const filteredAndSortedMovies = favoriteMovies
    .filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.original_title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedToFavorites) - new Date(a.addedToFavorites)
        case 'oldest':
          return new Date(a.addedToFavorites) - new Date(b.addedToFavorites)
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'year':
          return new Date(b.release_date || '1900') - new Date(a.release_date || '1900')
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
              <Heart className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Phim yêu thích</h1>
              <p className="text-gray-400 mt-1">
                {favoriteMovies.length} phim trong danh sách của bạn
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          {favoriteMovies.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim yêu thích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-white/20 rounded-lg px-4 py-3 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 hover:bg-black/40 transition-all min-w-[180px] cursor-pointer"

              >
                <option value="newest" className="bg-gray-800">Mới thêm nhất</option>
                <option value="oldest" className="bg-gray-800">Cũ nhất</option>
                <option value="rating" className="bg-gray-800">Đánh giá cao</option>
                <option value="title" className="bg-gray-800">Tên A-Z</option>
                <option value="year" className="bg-gray-800">Năm phát hành</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {favoriteMovies.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-gray-500" size={48} />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Chưa có phim yêu thích</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Hãy khám phá và thêm những bộ phim bạn yêu thích vào danh sách để xem lại sau!
            </p>
            <Link
              to="/browse/movies"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Play size={20} />
              Khám phá phim
            </Link>
          </div>
        ) : (
          <>
            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredAndSortedMovies.map(movie => (
                <div key={movie.id} className="group relative bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  {/* Poster */}
                  <div className="relative aspect-[2/3]">
                    <img
                      src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-2">
                        <Link
                          to={`browse/movie/${movie.id}`}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-full transition-colors"
                        >
                          <Play size={20} />
                        </Link>
                        <button
                          onClick={() => removeFavorite(movie.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <Star size={12} />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFavorite(movie.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Movie Info */}
                  <div className="p-3">
                    <Link to={`/browse/movie/${movie.id}`}>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {movie.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>{new Date(movie.release_date).getFullYear() || 'N/A'}</span>
                      
                      {movie.runtime && (
                        <>
                          <span>•</span>
                          <Clock size={12} />
                          <span>{movie.runtime}p</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No search results */}
            {filteredAndSortedMovies.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <Search className="mx-auto text-gray-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2">Không tìm thấy phim</h3>
                <p className="text-gray-400">
                  Không có phim nào khớp với từ khóa "<span className="text-yellow-400">{searchTerm}</span>"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-yellow-400 hover:text-yellow-300 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  )
}