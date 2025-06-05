import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../api/axios'

export default function MoviePage() {
  const [movies, setMovies] = useState([])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const movieType = searchParams.get('type') || '' // ex: ?type=korean

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`/movies${movieType ? `?type=${movieType}` : ''}`)
        setMovies(res.data)
      } catch (err) {
        console.error('Lỗi lấy danh sách phim', err)
      }
    }
    fetchMovies()
  }, [movieType])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1f] to-black text-white px-6 sm:px-10 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề & lọc */}
        <div className="flex justify-between items-center mb-6 mt-10">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {movieType ? `Phim ${movieType.charAt(0).toUpperCase() + movieType.slice(1)}` : 'Tất cả phim'}
          </h1>
          <button className="bg-white/10 border border-white/20 text-sm px-4 py-2 rounded-md hover:bg-white/20 transition">
            🧪 Bộ lọc
          </button>
        </div>

        {/* Grid phim */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
          {movies.map(movie => (
            <div
              key={movie.id}
              onClick={() => navigate(`/browse/movie/${movie.id}`)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                <img
                  src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                {/* Badge demo (tuỳ vào dữ liệu DB) */}
                <div className="absolute bottom-2 left-2 flex gap-1 text-xs font-bold">
                  <span className="bg-black/70 text-white px-1.5 py-0.5 rounded">T16</span>
                </div>
              </div>
              <h4 className="text-white text-sm font-semibold mt-2 truncate">{movie.title}</h4>
              <p className="text-gray-400 text-xs truncate">{movie.original_title || ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
