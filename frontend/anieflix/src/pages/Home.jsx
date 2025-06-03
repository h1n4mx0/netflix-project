import { useEffect, useState } from 'react'
import axios from '../api/axios'
import SlideRow from '../components/SlideRow'
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
      <SlideRow title="🔥 Phim đang hot" items={trending} onItemClick={setSelectedMovie} />
      <SlideRow title="⭐ Được người xem yêu thích" items={topRated} onItemClick={setSelectedMovie} />
      <SlideRow title="📅 Phim sắp chiếu" items={upcoming} onItemClick={setSelectedMovie} />

      {/* Popup hiển thị khi click vào phim */}
      {selectedMovie && (
        <MoviePopup movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  )
}
