import React, { useEffect, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, ThumbsUp, X, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Banner({ movies = [] }) {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (movies.length === 0) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % movies.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [movies])

  const movie = movies[index]
  if (!movie) return null

  return (
    <div className="w-full h-[500px] sm:h-[600px] relative overflow-hidden rounded-xl shadow-xl mb-10">
      <AnimatePresence mode="wait">
        <Motion.div
          key={movie.id}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: movie.backdrop_path
              ? `url('${movie.backdrop_path}')`
              : `url('https://via.placeholder.com/1280x720?text=No+Backdrop')`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
            <div className="absolute inset-0 z-10 pointer-events-none">
  {/* Mờ trung tâm ra ngoài bằng radial */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_60%,_rgba(0,0,0,0.6)_100%)]" />
  
  {/* Áp thêm lớp màu chủ đạo tím-xanh như Rophim */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95]/30 via-transparent to-[#0f172a]/50 mix-blend-multiply" />
</div>

          <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-10 max-w-4xl">
            <Motion.h1
              className="text-3xl sm:text-5xl font-bold text-white drop-shadow mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {movie.title}
            </Motion.h1>

            <Motion.p
              className="text-sm sm:text-base text-gray-300 line-clamp-3 mb-6 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {movie.overview || 'Không có mô tả.'}
            </Motion.p>

            <Motion.div
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold transition"
              >
                Xem ngay
              </button>
              <button
                onClick={() => navigate(`/browse/movie/${movie.id}`)}
                className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-full hover:bg-white/20 transition"
              >
                <Info size={20} /> 
              </button>
            </Motion.div>
          </div>
        </Motion.div>
      </AnimatePresence>
    </div>
  )
}
