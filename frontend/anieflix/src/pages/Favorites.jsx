import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Favorites() {
  const [movies, setMovies] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favIds = await axios.get('/favorites')
        const all = await axios.get('/movies') // Giả sử trả toàn bộ phim
        const filtered = all.data.filter(m => favIds.data.includes(m.id))
        setMovies(filtered)
      } catch (err) {
        console.error('[❌ Favorites Page]', err)
      }
    }

    fetchFavorites()
  }, [])

  return (
    <div className="pt-20 px-6 sm:px-12 pb-16 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6">🎬 Phim yêu thích của bạn</h1>

      {movies.length === 0 ? (
        <p className="text-gray-400">Bạn chưa thêm phim nào vào danh sách yêu thích.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <div
              key={movie.id}
              onClick={() => navigate(`/browse/movie/${movie.id}`)}
              className="cursor-pointer group"
            >
              <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                <img
                  src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Image'}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-sm text-center font-semibold truncate">{movie.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}