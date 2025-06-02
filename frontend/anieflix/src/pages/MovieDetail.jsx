import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { Play, Plus, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react'

export default function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const navigate = useNavigate()
  const [isFav, setIsFav] = useState(false)
  const [castPage, setCastPage] = useState(0)
  const itemsPerPage = 5

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await axios.get('/favorites')
        setIsFav(res.data.includes(Number(id)))
      } catch (err) {
        console.error('[❌ Favorites]', err)
      }
    }
    checkFavorite()
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
    } catch (err) {
      console.error('[❌ Toggle Favorite]', err)
    }
  }

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`/movies/${id}`)
        setMovie(res.data)
      } catch (err) {
        console.error('[❌ MovieDetail]', err)
      }
    }

    fetchMovie()
  }, [id])

  const paginatedCast = movie?.cast?.slice(
    castPage * itemsPerPage,
    (castPage + 1) * itemsPerPage
  ) || []

  const totalPages = Math.ceil((movie?.cast?.length || 0) / itemsPerPage)

  if (!movie) {
    return <div className="text-white text-center mt-20">Loading movie...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div
        className="w-full h-[500px] sm:h-[600px] bg-cover bg-center relative"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(${movie.backdrop_path})`
            : `url('https://via.placeholder.com/1280x720?text=No+Backdrop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto -mt-44 sm:-mt-56 p-6 sm:p-10 bg-black/80 rounded-lg shadow-lg flex flex-col sm:flex-row items-start gap-6">
        <img
          src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={movie.title}
          className="w-[140px] sm:w-[200px] rounded-lg shadow-md object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">{movie.title}</h1>
          <p className="text-gray-300 text-base sm:text-lg mb-6">
            {movie.overview || 'No description available.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm sm:text-base text-gray-300 mb-6">
            <div><strong>Language:</strong> {movie.original_language?.toUpperCase()}</div>
            <div><strong>Release Date:</strong> {movie.release_date}</div><br></br>
            <div><strong>Runtime:</strong> {movie.runtime} mins</div>
            <div><strong>Rating:</strong> ⭐ {movie.vote_average} ({movie.vote_count} votes)</div>
          </div>

          {paginatedCast.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Diễn viên</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-4">
                {paginatedCast.map((actor, idx) => (
                  <div key={idx} className="text-center text-sm">
                    {actor.profile_path && (
                      <img
                        src={actor.profile_path}
                        alt={actor.name}
                        className="w-24 h-36 object-cover rounded-md mx-auto mb-2 shadow"
                      />
                    )}
                    <div className="font-semibold">{actor.name}</div>
                    <div className="text-gray-400 text-xs">vai {actor.character}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
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

          <div className="flex gap-4 flex-wrap mt-8">
            <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition font-semibold">
              <Play size={20} /> Play
            </button>
            <button className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded hover:bg-white/20 transition">
              <Plus size={20} />
            </button>
            <button
              onClick={toggleFavorite}
              className={
                `flex items-center gap-2 px-4 py-2 rounded border transition font-semibold ${
                  isFav
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`
              }
            >
              <ThumbsUp size={20} />
              {isFav ? 'Đã thích' : 'Thêm yêu thích'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white px-4 py-2 hover:underline"
            >
              <ChevronLeft size={20} /> Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}