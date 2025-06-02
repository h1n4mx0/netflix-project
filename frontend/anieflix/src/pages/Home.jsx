import { useEffect, useState } from 'react'
import axios from '../api/axios'
import MovieRow from '../components/MovieRow'
import Banner from '../components/Banner'
import MoviePopup from '../components/MoviePopup' // 👈 import component popup mới

export default function Home() {
  const [trending, setTrending] = useState([])
  const [topRated, setTopRated] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, r, u] = await Promise.all([
          axios.get('/movies?type=trending'),
          axios.get('/movies?type=top_rated'),
          axios.get('/movies?type=upcoming')
        ])
        setTrending(t.data)
        setTopRated(r.data)
        setUpcoming(u.data)
      } catch (err) {
        console.error('[❌ API ERROR]', err)
      }
    }

    fetchAll()
  }, [])

  return (
    <div className="pt-14 px-4 sm:px-8 pb-16">
      <Banner movies={trending} />
      <MovieRow title="🔥 Phim đang hot" movies={trending} onMovieClick={setSelectedMovie} />
      <MovieRow title="⭐ Được người xem yêu thích" movies={topRated} onMovieClick={setSelectedMovie} />
      <MovieRow title="📅 Phim sắp chiếu" movies={upcoming} onMovieClick={setSelectedMovie} />

      {/* Popup hiển thị khi click vào phim */}
      {selectedMovie && (
        <MoviePopup movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  )
}
