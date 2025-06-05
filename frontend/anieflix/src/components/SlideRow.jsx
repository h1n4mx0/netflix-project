import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SlideRow({ title, items, onItemClick, viewAllUrl }) {
  const scrollRef = useRef()

  const scroll = (direction) => {
    const container = scrollRef.current
    const scrollAmount = 480
    if (direction === 'left') container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    else container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="relative bg-[#1a1a1f] rounded-2xl px-5 py-6 mb-10">
      {/* Title + Link */}
      <div className="flex justify-between items-center mb-5 px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {title}
        </h2>
        {viewAllUrl && (
          <a href={viewAllUrl} className="text-sm text-white/70 hover:text-yellow-400 transition font-medium">
            Xem toàn bộ &rarr;
          </a>
        )}
      </div>

      {/* Scrollable list */}
      <div className="relative">
        {/* Scroll Left */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white text-black shadow p-2 rounded-full hover:scale-110 transition hidden md:block"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-2 scroll-smooth hide-scrollbar"
        >
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              className="min-w-[180px] max-w-[200px] cursor-pointer group"
            >
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2">
                <img
                  src={item.poster_path || 'https://via.placeholder.com/300x450?text=No+Image'}
                  alt={item.title}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />

                {/* Badge */}
                <div className="absolute bottom-2 left-2 flex gap-1 text-xs font-bold">
                  {item.pd && (
                    <span className="bg-black/70 text-white px-1.5 py-0.5 rounded">
                      PD. {item.pd}
                    </span>
                  )}
                  {item.tm && (
                    <span className="bg-green-600 text-white px-1.5 py-0.5 rounded">
                      TM. {item.tm}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h4 className="text-white font-semibold text-sm truncate">
                {item.title}
              </h4>
              <p className="text-gray-400 text-xs truncate">{item.subtitle || item.original_title}</p>
            </div>
          ))}
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white text-black shadow p-2 rounded-full hover:scale-110 transition hidden md:block"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
