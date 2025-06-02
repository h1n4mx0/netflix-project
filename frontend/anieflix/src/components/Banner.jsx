import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Banner({ movies = [] }) {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (movies.length === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % movies.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [movies])

  const movie = movies[index]
  if (!movie) return null

  return (
    <div className="w-full h-[500px] sm:h-[600px] relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          className="absolute inset-0 flex items-end text-white bg-cover bg-center"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
          <motion.div
            className="relative z-20 p-8 max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 drop-shadow">{movie.title}</h1>
            <p className="text-sm sm:text-base text-gray-300 line-clamp-4 mb-6">{movie.overview}</p>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition font-semibold"
              >
                Xem ngay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/browse/movie/${movie.id}`)}
                className="bg-white/20 text-white px-6 py-2 rounded hover:bg-white/30 transition font-semibold border border-white/30"
              >
                Chi tiết
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
