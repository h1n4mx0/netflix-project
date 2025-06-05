import { Play, ThumbsUp, Plus } from 'lucide-react'

export default function HeroBanner({ movie }) {
  if (!movie) return null

  return (
    <div
      className="relative h-96 md:h-[500px] w-full bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${movie.backdrop})` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 p-6 md:p-12 max-w-2xl flex flex-col justify-end h-full space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold drop-shadow">
          {movie.title}
        </h1>
        <p className="text-sm opacity-80">IMDb {movie.imdb} · {movie.genre}</p>
        <p className="text-sm md:text-base line-clamp-3 opacity-90">{movie.overview}</p>
        <div className="flex space-x-3">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-1 text-sm font-semibold">
            <Play className="w-4 h-4" />
            <span>Play</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded flex items-center space-x-1 text-sm font-semibold">
            <ThumbsUp className="w-4 h-4" />
            <span>Thích</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded flex items-center space-x-1 text-sm font-semibold">
            <Plus className="w-4 h-4" />
            <span>Thêm</span>
          </button>
        </div>
        {movie.previews && (
          <div className="flex space-x-2 pt-2 overflow-x-auto hide-scrollbar">
            {movie.previews.map((img, idx) => (
              <img key={idx} src={img} alt="preview" className="w-24 h-14 object-cover rounded" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
