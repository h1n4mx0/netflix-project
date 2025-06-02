import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Plus, ThumbsUp, X, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MoviePopup({ movie, onClose }) {
  const navigate = useNavigate()

  // Đóng popup khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.id === 'popup-background') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  if (!movie) return null

  return (
    <div
      id="popup-background"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        className="bg-[#141414] text-white rounded-lg overflow-hidden max-w-4xl w-full relative shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Button Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-red-500 hover:scale-115"
        >
          <X size={28} />
        </button>

        {/* Backdrop */}
        <div
          className="w-full h-[250px] sm:h-[360px] relative bg-cover bg-center hover:scale-105 transition-transform duration-500 ease-in-out"
          style={{
            backgroundImage: movie.backdrop_path
              ? `url(${movie.backdrop_path})`
              : `url('https://via.placeholder.com/1280x720?text=No+Backdrop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Nội dung */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{movie.title}</h2>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">{movie.overview || 'No description available.'}</p>

          {/* Các nút tương tác */}
          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-200 transition">
              <Play size={20} /> Play
            </button>
            <button className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-md hover:bg-white/30 transition">
              <Plus size={20} />
            </button>
            <button className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-md hover:bg-white/30 transition">
              <ThumbsUp size={20} />
            </button>
            <button
              onClick={() => {
                onClose()
                navigate(`/browse/movie/${movie.id}`)
              }}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-md hover:bg-white/20 transition"
            >
              <Info size={20} /> Detail
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
