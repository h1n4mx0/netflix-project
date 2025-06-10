import React from 'react'

export default function MovieHoverCard({ movie }) {
  if (!movie) return null
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-[#111] text-white rounded-xl shadow-xl p-4 border border-white/10 hidden group-hover:block z-20">
      <div className="w-full h-32 bg-cover bg-center rounded-md overflow-hidden" style={{ backgroundImage: movie.backdrop_path ? `url(${movie.backdrop_path})` : `url('https://via.placeholder.com/300x169?text=No+Image')` }} />
      <h4 className="mt-3 font-semibold text-sm truncate">{movie.title}</h4>
      {movie.overview && (
        <p className="text-xs text-gray-300 mt-1 line-clamp-3">{movie.overview}</p>
      )}
      <div className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] rotate-45 border-l border-b border-white/10" />
    </div>
  )
}
