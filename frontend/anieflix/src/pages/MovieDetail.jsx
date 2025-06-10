// MovieDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { Play, Heart, Plus, Share2, MessageCircle } from 'lucide-react'

export default function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [isFav, setIsFav] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`/movies/${id}`).then(res => setMovie(res.data)).catch(() => {})
    axios.get(`/favorites`).then(res => {
      setIsFav(res.data.includes(Number(id)))
    }).catch(() => {})
  }, [id])

  const toggleFavorite = async () => {
    try {
      if (isFav) {
        await axios.delete(`/favorites/${id}`)
        setIsFav(false)
      } else {
        await axios.post(`/favorites`, { movie_id: id })
        setIsFav(true)
      }
    } catch {}
  }

  if (!movie) return <div className="text-white p-10">Không tìm thấy phim</div>

  return (
    <div className="min-h-screen text-white px-4 sm:px-10 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Backdrop */}
        <div
          className="w-full h-[300px] sm:h-[450px] bg-cover bg-center rounded-lg overflow-hidden relative mb-16"
          style={{
            backgroundImage: movie.backdrop_path
              ? `url(${movie.backdrop_path})`
              : `url('https://via.placeholder.com/1280x720?text=No+Backdrop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition">
              <Play size={22} /> Xem ngay
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10 mb-12">
          {/* Poster */}
          <div className="md:w-[200px] flex-shrink-0">
            <img
              src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={movie.title}
              className="rounded-lg w-full shadow-md"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-sm text-gray-400 mb-3">{movie.release_date} ・ {movie.original_language?.toUpperCase()}</p>

            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <span className="bg-yellow-600 px-2 py-1 rounded font-semibold">⭐ {movie.vote_average}</span>
              <span className="bg-gray-700 px-2 py-1 rounded">{movie.runtime} phút</span>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{movie.overview}</p>

            <div className="flex gap-4 flex-wrap text-sm mb-6">
              <button onClick={toggleFavorite} className="flex items-center gap-1 hover:underline text-white">
                <Heart size={18} /> {isFav ? 'Đã thích' : 'Yêu thích'}
              </button>
              <button className="flex items-center gap-1 hover:underline text-white">
                <Plus size={18} /> Thêm vào
              </button>
              <button className="flex items-center gap-1 hover:underline text-white">
                <Share2 size={18} /> Chia sẻ
              </button>
              <button className="flex items-center gap-1 hover:underline text-white">
                <MessageCircle size={18} /> Bình luận
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 text-sm font-semibold border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-2 ${activeTab === 'info' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Thông tin
              </button>
              <button
                onClick={() => setActiveTab('cast')}
                className={`pb-2 ${activeTab === 'cast' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Diễn viên
              </button>
            </div>

            {activeTab === 'cast' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {movie.cast?.map((actor, idx) => (
                  <div key={idx} className="text-center text-sm">
                    <img
                      src={actor.profile_path || 'https://via.placeholder.com/200x300?text=No+Image'}
                      alt={actor.name}
                      className="w-24 h-36 object-cover rounded-md mx-auto mb-2 shadow"
                    />
                    <div className="font-medium">{actor.name}</div>
                    <div className="text-gray-400 text-xs">vai {actor.character}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
