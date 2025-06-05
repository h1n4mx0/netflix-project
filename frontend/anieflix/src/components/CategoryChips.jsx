export default function CategoryChips({ categories = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 my-8">
      {categories.map(cat => (
        <div
          key={cat.id}
          className={`rounded-lg p-4 text-white flex flex-col justify-between ${cat.color}`}
        >
          <div>
            <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
            <p className="text-sm opacity-90 line-clamp-2">{cat.description}</p>
          </div>
          <button className="mt-4 bg-black/20 hover:bg-black/30 text-sm px-3 py-1 rounded self-start">
            Xem chi tiết
          </button>
        </div>
      ))}
    </div>
  )
}
