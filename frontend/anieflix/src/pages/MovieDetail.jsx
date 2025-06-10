import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { Play, Plus, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [isFav, setIsFav] = useState(false)
  const [castPage, setCastPage] = useState(0)
  const itemsPerPage = 5

  useEffect(() => {
    axios.get('/favorites').then(res => {
      setIsFav(res.data.includes(Number(id)))
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    axios.get(`/movies/${id}`).then(res => {
      setMovie(res.data)
    }).catch(() => {})
  }, [id])

  const toggleFavorite = async () => {
    try {
      if (isFav) {
        await axios.delete(`/favorites/${id}`)
        setIsFav(false)
      } else {
        await axios.post('/favorites', { movie_id: id })
        setIsFav(true)
      }
    } catch (err) {}
  }

  const paginatedCast = movie?.cast?.slice(
    castPage * itemsPerPage,
    (castPage + 1) * itemsPerPage
  ) || []

  const totalPages = Math.ceil((movie?.cast?.length || 0) / itemsPerPage)

  if (!movie) return <div className="text-white text-center mt-20">Đang tải phim...</div>

  return (



    <div className="min-h-screen pt-14 px-4 sm:px-8 pb-16 relative">

      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('${
            movie.backdrop_path || 'https://via.placeholder.com/1280x720?text=No+Backdrop'
          }')`
        }}
      />
      {/* Blur dark edges */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_60%,_rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
      </div>

      {/* Banner */}
      <div className="w-full h-screen flex items-end relative mb-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="relative z-10 p-6">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition">
            <Play size={22} /> Xem Ngay
          </button>
        </div>
      </div>

      {/* Chi tiết + hành động */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster */}
          <div className="md:w-[220px] ">
            <img
              src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={movie.title}
              className="w-full rounded-md shadow"
            />
          </div>

          {/* Nội dung */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{movie.title}</h1>
            <p className="text-sm text-gray-400 mb-4">
              {movie.release_date} ・ {movie.original_language?.toUpperCase()} ・ {movie.runtime} phút
            </p>

            <div className="flex flex-wrap gap-2 text-xs mb-4">
              <span className="bg-yellow-600 px-2 py-1 rounded font-semibold">⭐ {movie.vote_average} ({movie.vote_count})</span>
              {/* Add other tags if needed */}
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">{movie.overview}</p>

            {/* Nút hành động */}
            <div className="flex gap-4 flex-wrap mb-8">
              <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold transition">
                <Play size={18} /> Xem ngay
              </button>
              <button className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-4 py-2 rounded-md hover:bg-white/20 transition">
                <Plus size={18} /> Thêm vào
              </button>
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border font-semibold transition ${
                  isFav
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <ThumbsUp size={18} />
                {isFav ? 'Đã thích' : 'Yêu thích'}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white px-4 py-2 hover:underline"
              >
                <ChevronLeft size={18} /> Quay lại
              </button>
            </div>

            {/* Diễn viên */}
            {paginatedCast.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Diễn viên</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {paginatedCast.map((actor, idx) => (
                    <div key={idx} className="text-center text-sm">
                      {actor.profile_path ? (
                        <img
                          src={actor.profile_path}
                          alt={actor.name}
                          className="w-24 h-36 object-cover rounded-md mx-auto mb-2 shadow"
                        />
                      ) : (
                        <div className="w-24 h-36 bg-gray-700 flex items-center justify-center text-xs mx-auto mb-2 rounded-md">
                          No Image
                        </div>
                      )}
                      <div className="font-medium">{actor.name}</div>
                      <div className="text-gray-400 text-xs">vai {actor.character}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    disabled={castPage === 0}
                    onClick={() => setCastPage(p => Math.max(p - 1, 0))}
                    className="px-3 py-1 rounded bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    disabled={castPage === totalPages - 1}
                    onClick={() => setCastPage(p => Math.min(p + 1, totalPages - 1))}
                    className="px-3 py-1 rounded bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
