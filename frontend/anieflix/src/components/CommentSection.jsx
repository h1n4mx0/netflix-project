export default function CommentSection({ comments = [], stats = {} }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 my-10 text-white">
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-xl font-semibold">Top bình luận gần đây</h3>
        {comments.map(c => (
          <div key={c.id} className="flex space-x-3 bg-white/10 p-3 rounded">
            <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{c.user}</p>
              <p className="text-sm opacity-90">{c.content}</p>
              <p className="text-xs opacity-50">{c.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Thống kê</h3>
        <div className="bg-white/10 p-4 rounded">
          <p className="font-semibold mb-2">Người xem nhiều nhất</p>
          <p className="text-sm opacity-90">{stats.topViewer}</p>
        </div>
        <div className="bg-white/10 p-4 rounded">
          <p className="font-semibold mb-2">Phim được yêu thích</p>
          <p className="text-sm opacity-90">{stats.favMovie}</p>
        </div>
        <div className="bg-white/10 p-4 rounded">
          <p className="font-semibold mb-2">Phim hot gần đây</p>
          <p className="text-sm opacity-90">{stats.hotMovie}</p>
        </div>
      </div>
    </div>
  )
}
