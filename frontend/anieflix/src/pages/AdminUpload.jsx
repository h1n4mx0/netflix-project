import { useState } from 'react'
import { Upload, Film, Save, X, Plus, Trash2, Star, Calendar, Clock, Users } from 'lucide-react'

export default function AdminUpload() {
  const [movie, setMovie] = useState({
    title: '',
    original_title: '',
    overview: '',
    release_date: '',
    genre_ids: '',
    original_language: 'vi',
    vote_average: 0,
    vote_count: 0,
    runtime: 0,
    tag: 'trending',
    cast: []
  })

  const [files, setFiles] = useState({
    poster: null,
    backdrop: null,
    video: null
  })

  const [castMember, setCastMember] = useState({
    name: '',
    character: '',
    profile_path: ''
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const handleInputChange = (field, value) => {
    setMovie(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (type, file) => {
    setFiles(prev => ({
      ...prev,
      [type]: file
    }))
  }

  const addCastMember = () => {
    if (castMember.name.trim() && castMember.character.trim()) {
      setMovie(prev => ({
        ...prev,
        cast: [...prev.cast, { ...castMember, id: Date.now() }]
      }))
      setCastMember({ name: '', character: '', profile_path: '' })
    }
  }

  const removeCastMember = (id) => {
    setMovie(prev => ({
      ...prev,
      cast: prev.cast.filter(member => member.id !== id)
    }))
  }

  const validateForm = () => {
    const required = ['title', 'overview', 'release_date']
    const missing = required.filter(field => !movie[field].trim())
    
    if (missing.length > 0) {
      setToast({
        open: true,
        message: `Vui lòng điền đầy đủ: ${missing.join(', ')}`,
        severity: 'error'
      })
      return false
    }

    if (!files.poster) {
      setToast({
        open: true,
        message: 'Vui lòng chọn poster cho phim',
        severity: 'error'
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      
      // Basic movie info
      Object.keys(movie).forEach(key => {
        if (key === 'cast') {
          formData.append(key, JSON.stringify(movie[key]))
        } else {
          formData.append(key, movie[key])
        }
      })

      // Files
      if (files.poster) formData.append('poster', files.poster)
      if (files.backdrop) formData.append('backdrop', files.backdrop)
      if (files.video) formData.append('video', files.video)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/admin/upload-movie', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      setToast({
        open: true,
        message: 'Upload phim thành công!',
        severity: 'success'
      })

      // Reset form
      setMovie({
        title: '',
        original_title: '',
        overview: '',
        release_date: '',
        genre_ids: '',
        original_language: 'vi',
        vote_average: 0,
        vote_count: 0,
        runtime: 0,
        tag: 'trending',
        cast: []
      })
      setFiles({ poster: null, backdrop: null, video: null })
      setUploadProgress(0)

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        setToast(prev => ({ ...prev, open: false }))
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setToast({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi upload phim',
        severity: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setMovie({
      title: '',
      original_title: '',
      overview: '',
      release_date: '',
      genre_ids: '',
      original_language: 'vi',
      vote_average: 0,
      vote_count: 0,
      runtime: 0,
      tag: 'trending',
      cast: []
    })
    setFiles({ poster: null, backdrop: null, video: null })
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Upload className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Upload Phim Mới</h1>
              <p className="text-gray-400">Thêm phim mới vào hệ thống</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Film size={20} />
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tên phim *</label>
                <input
                  type="text"
                  value={movie.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên phim..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên gốc</label>
                <input
                  type="text"
                  value={movie.original_title}
                  onChange={(e) => handleInputChange('original_title', e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tên gốc (nếu có)..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Mô tả *</label>
                <textarea
                  value={movie.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                  rows="4"
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Mô tả nội dung phim..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Ngày phát hành *
                </label>
                <input
                  type="date"
                  value={movie.release_date}
                  onChange={(e) => handleInputChange('release_date', e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={movie.runtime}
                  onChange={(e) => handleInputChange('runtime', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thể loại</label>
                <input
                  type="text"
                  value={movie.genre_ids}
                  onChange={(e) => handleInputChange('genre_ids', e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Action, Drama, Thriller..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                <select
                  value={movie.original_language}
                  onChange={(e) => handleInputChange('original_language', e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Star size={16} />
                  Điểm đánh giá
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={movie.vote_average}
                  onChange={(e) => handleInputChange('vote_average', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tag</label>
                <select
                  value={movie.tag}
                  onChange={(e) => handleInputChange('tag', e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="trending">Trending</option>
                  <option value="top_rated">Top Rated</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cast Information */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users size={20} />
              Diễn viên
            </h2>

            {/* Add Cast Member */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={castMember.name}
                onChange={(e) => setCastMember(prev => ({ ...prev, name: e.target.value }))}
                className="bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tên diễn viên..."
              />
              <input
                type="text"
                value={castMember.character}
                onChange={(e) => setCastMember(prev => ({ ...prev, character: e.target.value }))}
                className="bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vai diễn..."
              />
              <button
                type="button"
                onClick={addCastMember}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>

            {/* Cast List */}
            {movie.cast.length > 0 && (
              <div className="space-y-2">
                {movie.cast.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-gray-400 ml-2">vai {member.character}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCastMember(member.id)}
                      className="text-red-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Uploads */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">File Upload</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Poster Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Poster *</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('poster', e.target.files[0])}
                    className="hidden"
                    id="poster-upload"
                  />
                  <label htmlFor="poster-upload" className="cursor-pointer">
                    {files.poster ? (
                      <div>
                        <img
                          src={URL.createObjectURL(files.poster)}
                          alt="Poster preview"
                          className="w-20 h-28 object-cover mx-auto mb-2 rounded"
                        />
                        <p className="text-sm text-green-400">{files.poster.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm text-gray-400">Click to upload poster</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Backdrop Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Backdrop</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('backdrop', e.target.files[0])}
                    className="hidden"
                    id="backdrop-upload"
                  />
                  <label htmlFor="backdrop-upload" className="cursor-pointer">
                    {files.backdrop ? (
                      <div>
                        <img
                          src={URL.createObjectURL(files.backdrop)}
                          alt="Backdrop preview"
                          className="w-20 h-12 object-cover mx-auto mb-2 rounded"
                        />
                        <p className="text-sm text-green-400">{files.backdrop.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm text-gray-400">Click to upload backdrop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Video</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video', e.target.files[0])}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    {files.video ? (
                      <div>
                        <Film className="mx-auto mb-2 text-green-400" size={24} />
                        <p className="text-sm text-green-400">{files.video.name}</p>
                        <p className="text-xs text-gray-400">
                          {(files.video.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-sm text-gray-400">Click to upload video</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-gray-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isUploading}
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              Reset
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Upload Phim
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toast Display */}
        {toast.open && (
          <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className={`p-4 rounded-lg shadow-lg ${
              toast.severity === 'success' ? 'bg-green-600' : 
              toast.severity === 'error' ? 'bg-red-600' : 
              'bg-blue-600'
            } text-white`}>
              <div className="flex items-center justify-between">
                <p className="text-sm">{toast.message}</p>
                <button
                  onClick={() => setToast({ ...toast, open: false })}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}