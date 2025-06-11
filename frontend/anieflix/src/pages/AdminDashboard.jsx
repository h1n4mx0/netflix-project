import { useState, useEffect } from 'react'
import { BarChart3, Film, Users, MessageCircle, Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState({})
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchStats()
    if (activeTab === 'movies') {
      fetchMovies()
    }
  }, [activeTab, currentPage, searchTerm])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/movies?page=${currentPage}&limit=10&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMovies(data.movies)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMovie = async (movieId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) return

    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        fetchMovies() // Refresh list
        alert('Xóa phim thành công!')
      } else {
        alert('Có lỗi xảy ra khi xóa phim')
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert('Có lỗi xảy ra khi xóa phim')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-gradient-to-r ${color} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-full">
          <Icon size={24} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Quản lý hệ thống Anieflix</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'stats' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 size={16} />
            Thống kê
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'movies' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Film size={16} />
            Quản lý phim
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Plus size={16} />
            Upload phim
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng số phim"
                value={stats.total_movies || 0}
                icon={Film}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Người dùng"
                value={stats.total_users || 0}
                icon={Users}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Bình luận"
                value={stats.total_comments || 0}
                icon={MessageCircle}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Upload gần đây"
                value={stats.recent_uploads || 0}
                icon={Calendar}
                color="from-orange-500 to-orange-600"
              />
            </div>

            {/* Movies by Category */}
            {stats.movies_by_tag && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Phim theo danh mục</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.movies_by_tag).map(([tag, count]) => (
                    <div key={tag} className="bg-white/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{count}</p>
                      <p className="text-sm text-gray-400 capitalize">{tag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Movies Management Tab */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Thêm phim
              </button>
            </div>

            {/* Movies Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="text-left p-4 font-medium">Phim</th>
                      <th className="text-left p-4 font-medium">Ngày phát hành</th>
                      <th className="text-left p-4 font-medium">Đánh giá</th>
                      <th className="text-left p-4 font-medium">Danh mục</th>
                      <th className="text-left p-4 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-400 mt-2">Đang tải...</p>
                        </td>
                      </tr>
                    ) : movies.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8 text-gray-400">
                          Không có phim nào
                        </td>
                      </tr>
                    ) : (
                      movies.map(movie => (
                        <tr key={movie.id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={movie.poster_path || 'https://via.placeholder.com/60x90?text=No+Image'}
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-white">{movie.title}</p>
                                {movie.original_title && (
                                  <p className="text-sm text-gray-400">{movie.original_title}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{movie.release_date}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span className="text-white">{movie.vote_average}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-sm capitalize">
                              {movie.tag}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => window.open(`/browse/movie/${movie.id}`, '_blank')}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                title="Xem phim"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteMovie(movie.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Xóa phim"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                    >
                      Trước
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              currentPage === page 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                    >
                      Tiếp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Tab - Show Upload Component */}
        {activeTab === 'upload' && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Trang upload phim sẽ được hiển thị ở đây. Bạn có thể tích hợp component AdminUpload vào đây.
              </p>
              <button
                onClick={() => window.location.href = '/admin/upload'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Đi tới trang Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}