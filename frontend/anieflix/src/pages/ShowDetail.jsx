import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Play, Heart, Plus, Share2, MessageCircle } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'

export default function ShowDetail() {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [currentEp, setCurrentEp] = useState(null)
  const [activeTab, setActiveTab] = useState('episodes')
  const [suggested, setSuggested] = useState([])


  useEffect(() => {
    axios.get(`/shows/${id}`)
      .then(res => setShow(res.data))
      .catch(() => setShow(null))
  }, [id])

  useEffect(() => {
    axios
      .get('/shows')
      .then(res =>
        setSuggested(res.data.filter(s => String(s.id) !== String(id)).slice(0, 8))
      )
      .catch(() => setSuggested([]))
  }, [id])


  const handleNextEpisode = () => {
    if (!show || !currentEp) return
    const idx = show.episodes.findIndex(ep => ep.id === currentEp.id)
    if (idx < show.episodes.length - 1) {
      setCurrentEp(show.episodes[idx + 1])
    }
  }

  const handlePrevEpisode = () => {
    if (!show || !currentEp) return
    const idx = show.episodes.findIndex(ep => ep.id === currentEp.id)
    if (idx > 0) {
      setCurrentEp(show.episodes[idx - 1])
    }
  }

  const currentIndex = currentEp ? show?.episodes.findIndex(ep => ep.id === currentEp.id) : -1
  const hasNext = currentIndex >= 0 && currentIndex < (show?.episodes.length || 0) - 1
  const hasPrevious = currentIndex > 0

  if (!show) return <div className="text-white p-10">Không tìm thấy chương trình</div>

  return (
    <div className="min-h-screen text-white px-4 sm:px-10 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Banner top */}
        <div
          className="w-full h-[300px] sm:h-[450px] bg-cover bg-center rounded-lg overflow-hidden relative mb-16"
          style={{
            backgroundImage: show.show_poster
              ? `url(${show.show_poster})`
              : `url('https://via.placeholder.com/1280x720?text=No+Backdrop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <button
              onClick={() => {
                if (show.episodes?.length) {
                  setCurrentEp(show.episodes[0])
                }
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition"
            >
              <Play size={22} /> Xem Ngay
            </button>
          </div>
        </div>

        {/* Info section */}
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          {/* Poster */}
          <div className="md:w-[200px] flex-shrink-0">
            <img
              src={show.show_poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={show.title}
              className="rounded-lg w-full shadow-md"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{show.title}</h1>
            <p className="text-sm text-gray-400 mb-3">{show.year} ・ {show.genre}</p>

            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <span className="bg-yellow-600 px-2 py-1 rounded font-semibold">IMDb {show.imdb || 'N/A'}</span>
              <span className="bg-gray-700 px-2 py-1 rounded">T{show.age_rating || 'T16'}</span>
              {show.tags?.map((tag, idx) => (
                <span key={idx} className="bg-white/10 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{show.description}</p>

            <div className="flex gap-4 flex-wrap text-sm mb-6">
              <button className="flex items-center gap-1 hover:underline text-white">
                <Heart size={18} /> Yêu thích
              </button>
              <button className="flex items-center gap-1 hover:underline text-white">
                <Plus size={18} /> Thêm vào
              </button>
              <button className="flex items-center gap-1 hover:underline text-white">
                <Share2 size={18} /> Chia sẻ
              </button>
              <button className="flex items-center gap-1 hover:underline text-white">
                <MessageCircle size={18} /> Bình luận
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 text-sm font-semibold border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab('episodes')}
                className={`pb-2 ${activeTab === 'episodes' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Tập phim
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`pb-2 ${activeTab === 'gallery' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('cast')}
                className={`pb-2 ${activeTab === 'cast' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Diễn viên
              </button>
              <button
                onClick={() => setActiveTab('suggest')}
                className={`pb-2 ${activeTab === 'suggest' ? 'border-b-2 border-yellow-400 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Đề xuất
              </button>
            </div>

            {activeTab === 'episodes' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {show.episodes.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => setCurrentEp(ep)}
                  className="bg-[#1e1e1e] hover:bg-white/10 transition text-white rounded-md overflow-hidden flex flex-col"
                >
                  {ep.thumbnail_url ? (
                    <img
                      src={`/api/static/show-thumbnail/${ep.thumbnail_url}`}
                      alt={ep.title}
                      className="w-full h-[120px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[120px] bg-gray-700 flex items-center justify-center text-sm text-gray-300">
                      No Thumbnail
                    </div>
                  )}
                  <div className="p-2 text-sm text-center">{ep.title}</div>
                </button>
              ))}
            </div>
            )}

            {activeTab === 'suggest' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {suggested.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentEp(null)
                      navigate(`/browse/shows/${item.id}`)
                    }}
                    className="cursor-pointer bg-[#1e1e1e] hover:bg-white/10 rounded-md overflow-hidden"
                  >
                    <img
                      src={item.show_poster || 'https://via.placeholder.com/300x400?text=No+Image'}
                      alt={item.title}
                      className="w-full h-[160px] object-cover"
                    />
                    <div className="p-2 text-sm text-center truncate">{item.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {currentEp && (
        <div className="fixed inset-0 bg-black z-50">
          <VideoPlayer
            videoUrl={`/api/stream/show/${id}/episode/${currentEp.id}`}
            title={show.title}
            subtitle={currentEp.title}
            poster={currentEp.thumbnail_url ? `/api/static/show-thumbnail/${currentEp.thumbnail_url}` : show.show_poster}
            onNext={hasNext ? handleNextEpisode : null}
            onPrevious={hasPrevious ? handlePrevEpisode : null}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            autoPlay={true}
            isHLS={true}
            onClose={() => setCurrentEp(null)}
          />
        </div>
      )}
    </div>
  )
}
