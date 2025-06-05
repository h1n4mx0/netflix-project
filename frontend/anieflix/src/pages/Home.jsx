import HeroBanner from '../components/HeroBanner'
import CategoryChips from '../components/CategoryChips'
import MovieRow from '../components/MovieRow'
import CommentSection from '../components/CommentSection'
import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Home() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await api.get('/movies')
        setMovies(res.data)
      } catch (e) {
        console.error('Failed to load movies', e)
      }
    }

    fetchMovies()
  }, [])

  const categories = [
    { id: 1, name: 'Marvel', color: 'bg-red-600', description: 'Vũ trụ siêu anh hùng Marvel' },
    { id: 2, name: '4K', color: 'bg-blue-600', description: 'Chất lượng cao 4K sắc nét' },
    { id: 3, name: 'Sitcom', color: 'bg-green-600', description: 'Hài hước giải trí' },
    { id: 4, name: 'Xuyên Không', color: 'bg-purple-600', description: 'Phiêu lưu vượt thời gian' }
  ]

  const comments = [
    { id: 1, user: 'An', avatar: 'https://i.pravatar.cc/40?img=1', content: 'Phim hay quá!', time: '1 giờ trước' },
    { id: 2, user: 'Bình', avatar: 'https://i.pravatar.cc/40?img=2', content: 'Mong có phần tiếp theo.', time: '3 giờ trước' }
  ]

  const stats = {
    topViewer: 'user123',
    favMovie: 'Avengers: Endgame',
    hotMovie: 'The Witcher'
  }

  return (
    <div className="space-y-12">
      {movies.length > 0 && <HeroBanner movie={movies[0]} />}
      <CategoryChips categories={categories} />
      <MovieRow title="Phim Hàn Quốc mới" movies={movies} onMovieClick={() => {}} />
      <MovieRow title="Phim Trung Quốc mới" movies={movies} onMovieClick={() => {}} />
      <MovieRow title="Phim US-UK mới" movies={movies} onMovieClick={() => {}} />
      <CommentSection comments={comments} stats={stats} />
    </div>
  )
}
