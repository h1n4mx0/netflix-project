import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import VideoPlayer from '../components/VideoPlayer'

export default function WatchShow() {
  const { showId, episodeId } = useParams()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState(null)
  const [show, setShow] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch show details
        const showRes = await axios.get(`/shows/${showId}`)
        setShow(showRes.data)
        setEpisodes(showRes.data.episodes || [])

        // Find current episode
        const currentEp = showRes.data.episodes?.find(ep => ep.id === parseInt(episodeId))
        if (currentEp) {
          setEpisode(currentEp)
        } else {
          setError('Không tìm thấy tập phim')
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching show data:', err)
        setError('Không thể tải chương trình. Vui lòng thử lại sau.')
        setLoading(false)
      }
    }

    fetchData()
  }, [showId, episodeId])

  const handleNextEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.id === parseInt(episodeId))
    if (currentIndex < episodes.length - 1) {
      const nextEp = episodes[currentIndex + 1]
      navigate(`/shows/${showId}/watch/${nextEp.id}`)
    }
  }

  const handlePreviousEpisode = () => {
    const currentIndex = episodes.findIndex(ep => ep.id === parseInt(episodeId))
    if (currentIndex > 0) {
      const prevEp = episodes[currentIndex - 1]
      navigate(`/shows/${showId}/watch/${prevEp.id}`)
    }
  }

  const hasNext = episodes.findIndex(ep => ep.id === parseInt(episodeId)) < episodes.length - 1
  const hasPrevious = episodes.findIndex(ep => ep.id === parseInt(episodeId)) > 0

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-lg">Đang tải tập phim...</div>
      </div>
    )
  }

  if (error || !episode || !show) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Không tìm thấy tập phim'}</p>
          <button 
            onClick={() => navigate(`/browse/shows/${showId}`)}
            className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black">
      <VideoPlayer
        videoUrl={`/api/stream/show/${showId}/episode/${episodeId}`}
        title={show.title}
        subtitle={episode.title}
        poster={episode.thumbnail_url ? `/api/static/show-thumbnail/${episode.thumbnail_url}` : show.show_poster}
        onNext={hasNext ? handleNextEpisode : null}
        onPrevious={hasPrevious ? handlePreviousEpisode : null}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        autoPlay={true}
        isHLS={true}
      />

      {/* Episode list sidebar */}
      <div className="absolute top-20 right-4 w-80 max-h-[calc(100vh-120px)] overflow-y-auto bg-black/80 backdrop-blur rounded-lg p-4 hidden lg:block">
        <h3 className="text-white font-bold mb-4">Danh sách tập</h3>
        <div className="space-y-2">
          {episodes.map(ep => (
            <button
              key={ep.id}
              onClick={() => navigate(`/shows/${showId}/watch/${ep.id}`)}
              className={`w-full text-left p-3 rounded-lg transition ${
                ep.id === parseInt(episodeId)
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="font-semibold">Tập {ep.episode_number}</div>
              <div className="text-sm opacity-80">{ep.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}