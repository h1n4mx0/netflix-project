import { useEffect, useState } from 'react'
import axios from 'axios'

export default function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        axios
          .get(`/api/search?q=${encodeURIComponent(query)}`)
          .then(res => setResults(res.data))
          .catch(err => console.error(err))
      } else {
        setResults([])
      }
    }, 400) // debounce: đợi 400ms sau khi người dùng ngừng gõ

    return () => clearTimeout(delayDebounce)
  }, [query])

  return (
    <div className="px-6 py-8 text-white">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Tìm kiếm phim hoặc show..."
        className="w-full p-2 mb-4 rounded bg-gray-700 text-white placeholder-gray-400"
      />
      <h2 className="text-xl font-semibold mb-4">Kết quả cho: "{query}"</h2>
      {results.length === 0 ? (
        <p>Không tìm thấy kết quả nào.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map(item => (
            <div key={`${item.type}-${item.id}`} className="bg-gray-800 rounded p-2">
              {item.poster_path && (
                <img
                  src={item.poster_path}
                  alt={item.title}
                  className="w-full h-auto rounded mb-2"
                />
              )}
              <h3 className="text-sm font-bold">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.release_date}</p>
              <p className="text-xs text-yellow-400 uppercase">{item.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
