import React from 'react'

export default function MovieHoverCard({ movie }) {
  if (!movie) return null
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#141414] text-white rounded-lg shadow-lg p-3 hidden group-hover:block z-20">
      <div className="w-full h-32 bg-cover bg-center rounded" style={{ backgroundImage: movie.backdrop_path ? `url(${movie.backdrop_path})` : `url('https://via.placeholder.com/300x169?text=No+Image')` }} />
      <h4 className="mt-2 font-semibold text-sm truncate">{movie.title}</h4>
      {movie.overview && <p className="text-xs text-gray-300 mt-1 line-clamp-3">{movie.overview}</p>}
    </div>
  )
}
