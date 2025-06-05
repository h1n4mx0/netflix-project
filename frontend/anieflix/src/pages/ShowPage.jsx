// ShowPage.jsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ShowPage() {
  const navigate = useNavigate()
  const [shows, setShows] = useState([])

  useEffect(() => {
    axios.get('/api/shows')
      .then(res => setShows(res.data))
      .catch(() => setShows([]))
  }, [])

  if (!shows.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Không có chương trình nào được hiển thị.
      </div>
    )
  }

  return (
    <div className="pt-14 px-4 sm:px-8 pb-16">

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">📺 Chương trình thực tế</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {shows.map(show => (
            <div
              key={show.id}
              onClick={() => navigate(`/browse/shows/${show.id}`)}
              className="cursor-pointer group rounded-lg overflow-hidden bg-[#1e1e1e] hover:shadow-xl transition-transform hover:scale-105"
            >
              <div className="aspect-[3/4] bg-gray-800 relative">
                <img
                  src={show.show_poster || 'https://via.placeholder.com/300x400?text=No+Image'}
                  alt={show.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-opacity" />
              </div>
              <div className="p-3">
                <h3 className="text-sm sm:text-base font-semibold truncate mb-1">{show.title}</h3>
                <p className="text-xs text-gray-400">{show.year} ・ {show.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
