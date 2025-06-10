import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

export default function MoviePage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    axios
      .get('/movies')
      .then(res => setMovies(res.data))
      .catch(() => setMovies([]))
  }, [])

  if (!movies.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Không có phim nào được hiển thị.
      </div>
    )
  }

  return (
    <div className="pt-7 px-4 sm:px-8 pb-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">🎬 Phim truyện</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map(movie => (
            <div
              key={movie.id}
              onClick={() => navigate(`/browse/movie/${movie.id}`)}
              className="cursor-pointer group rounded-lg overflow-hidden bg-[#1e1e1e] hover:shadow-xl transition-transform hover:scale-105"
            >
              <div className="aspect-[2/3] bg-gray-800 relative">
                <img
                  src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-opacity" />
              </div>
              <div className="p-3">
                <h3 className="text-sm sm:text-base font-semibold truncate mb-1">{movie.title}</h3>
                <p className="text-xs text-gray-400">{movie.release_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
