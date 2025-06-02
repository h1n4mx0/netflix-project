import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MovieRow({ title, movies, onMovieClick }) {
  const scrollRef = useRef()

  const scroll = (direction) => {
    const container = scrollRef.current
    const scrollAmount = 400

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative mb-8">
      <h3 className="text-white text-xl font-semibold mb-3 ml-2">{title}</h3>

      {/* Nút scroll trái */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/80 transition hidden sm:block"
      >
        <ChevronLeft className="text-white w-6 h-6" />
      </button>

      {/* Danh sách phim scroll ngang */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto overflow-visible overflow-y-hidden scroll-smooth px-2 sm:px-4 snap-x snap-mandatory hide-scrollbar"
      >
        {movies.map(movie => (
          <div
            key={movie.id}
            onClick={() => onMovieClick(movie)}
            className="snap-start shrink-0 w-[140px] sm:w-[180px] md:w-[200px] cursor-pointer"
          >
            <div className="group relative hover:scale-105 transition-transform duration-300">
              <img
                src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Image'}
                alt={movie.title}
                className="rounded-lg object-cover shadow-md w-full"
              />
              <p className="text-white text-sm mt-2 truncate text-center">{movie.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Nút scroll phải */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/80 transition hidden sm:block"
      >
        <ChevronRight className="text-white w-6 h-6" />
      </button>
    </div>
  )
}
