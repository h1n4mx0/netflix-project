import { useState, useEffect, useRef } from 'react'
import axios from '../api/axios'
import { MessageCircle, Send, User, Calendar, ThumbsUp, ThumbsDown, Reply } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CommentSystem({ 
  contentId, 
  contentType, // 'movie' or 'show'
  className = ""
}) {
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [anonymousName, setAnonymousName] = useState('Người dùng ẩn danh')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('newest')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [expandedReplies, setExpandedReplies] = useState(new Set())

  useEffect(() => {
    fetchComments()
    // Load saved anonymous name from localStorage
    const savedName = localStorage.getItem('anonymousName')
    if (savedName) {
      setAnonymousName(savedName)
    }
  }, [contentId, contentType])

  useEffect(() => {
    fetchComments()
  }, [currentPage, sortBy])

  const getApiEndpoints = () => {
    if (contentType === 'show') {
      return {
        comments: `/shows/${contentId}/comments`,
        replies: (commentId) => `/show-comments/${commentId}/replies`,
        react: (commentId) => `/show-comments/${commentId}/react`
      }
    } else {
      return {
        comments: `/movies/${contentId}/comments`,
        replies: (commentId) => `/comments/${commentId}/replies`,
        react: (commentId) => `/comments/${commentId}/react`
      }
    }
  }

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const endpoints = getApiEndpoints()
      const res = await axios.get(endpoints.comments, {
        params: {
          page: currentPage,
          limit: 10,
          sort: sortBy
        }
      })
      setComments(res.data.comments)
      setTotalPages(res.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Có lỗi xảy ra khi tải bình luận')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Save anonymous name to localStorage
      localStorage.setItem('anonymousName', anonymousName)
      
      const endpoints = getApiEndpoints()
      await axios.post(endpoints.comments, {
        content: commentText.trim(),
        anonymous_name: anonymousName.trim()
      })
      
      // Refresh comments after successful submission
      await fetchComments()
      setCommentText('')
      toast.success('Đã gửi bình luận thành công!')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Có lỗi xảy ra khi gửi bình luận')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault()
    if (!replyText.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const endpoints = getApiEndpoints()
      await axios.post(endpoints.comments, {
        content: replyText.trim(),
        parent_id: commentId,
        anonymous_name: anonymousName.trim()
      })
      
      setReplyText('')
      setReplyingTo(null)
      await fetchComments()
      toast.success('Đã gửi phản hồi thành công!')
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error('Có lỗi xảy ra khi gửi phản hồi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReaction = async (commentId, reactionType) => {
    try {
      const endpoints = getApiEndpoints()
      await axios.post(endpoints.react(commentId), {
        reaction_type: reactionType
      })
      await fetchComments()
    } catch (error) {
      console.error('Error reacting to comment:', error)
      toast.error('Có lỗi xảy ra khi thực hiện reaction')
    }
  }

  const loadReplies = async (commentId) => {
    try {
      const endpoints = getApiEndpoints()
      const res = await axios.get(endpoints.replies(commentId))
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, replies: res.data.replies }
        }
        return comment
      })
      setComments(updatedComments)
      setExpandedReplies(prev => new Set([...prev, commentId]))
    } catch (error) {
      console.error('Error loading replies:', error)
      toast.error('Có lỗi xảy ra khi tải phản hồi')
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`
  }

  return (
    <div className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-8 border border-white/5 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-full">
            <MessageCircle className="text-yellow-400" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white">Bình luận</h3>
          <span className="text-sm text-gray-400 bg-white/10 px-2 py-1 rounded-full">
            {comments.length} bình luận
          </span>
        </div>

        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-black/30 border border-white/10 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="most_liked">Nhiều like nhất</option>
        </select>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-8">
        {/* Anonymous Name Input */}
        <div className="mb-4">
          <input
            type="text"
            value={anonymousName}
            onChange={e => setAnonymousName(e.target.value)}
            className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 placeholder-gray-500"
            placeholder="Tên hiển thị..."
            maxLength={100}
          />
        </div>

        <div className="relative">
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="w-full bg-black/30 border border-white/10 text-white rounded-xl p-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 resize-none transition-all duration-200 placeholder-gray-500"
            rows="4"
            placeholder={`Chia sẻ suy nghĩ của bạn về ${contentType === 'movie' ? 'bộ phim' : 'chương trình'} này...`}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">{commentText.length}/1000</span>
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm text-black font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Gửi bình luận
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Đang tải bình luận...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-gray-500" size={32} />
            </div>
            <p className="text-gray-400 text-lg">Chưa có bình luận nào</p>
            <p className="text-gray-500 text-sm mt-2">
              Hãy là người đầu tiên chia sẻ cảm nhận về {contentType === 'movie' ? 'bộ phim' : 'chương trình'} này!
            </p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-black" size={20} />
                </div>
                
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{comment.anonymous_name}</h4>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar size={12} />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed text-sm mb-4">
                    {comment.content}
                  </p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => handleReaction(comment.id, 'like')}
                      className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <ThumbsUp size={16} />
                      <span>{comment.likes_count || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleReaction(comment.id, 'dislike')}
                      className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <ThumbsDown size={16} />
                      <span>{comment.dislikes_count || 0}</span>
                    </button>

                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Reply size={16} />
                      Phản hồi
                    </button>

                    {comment.replies_count > 0 && (
                      <button
                        onClick={() => expandedReplies.has(comment.id) ? 
                          setExpandedReplies(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(comment.id)
                            return newSet
                          }) : 
                          loadReplies(comment.id)
                        }
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        {expandedReplies.has(comment.id) ? 'Ẩn' : 'Hiển thị'} {comment.replies_count} phản hồi
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4">
                      <div className="relative">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none"
                          rows="3"
                          placeholder="Viết phản hồi..."
                          disabled={isSubmitting}
                          maxLength={1000}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{replyText.length}/1000</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyText('')
                              }}
                              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              disabled={!replyText.trim() || isSubmitting}
                              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-3 py-1 rounded text-sm text-black font-medium transition-colors"
                            >
                              Gửi
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Replies */}
                  {expandedReplies.has(comment.id) && comment.replies && (
                    <div className="mt-4 space-y-4 border-l-2 border-white/10 pl-4">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="text-white" size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-white text-sm">{reply.anonymous_name}</h5>
                                <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{reply.content}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <button
                                  onClick={() => handleReaction(reply.id, 'like')}
                                  className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
                                >
                                  <ThumbsUp size={12} />
                                  <span>{reply.likes_count || 0}</span>
                                </button>
                                <button
                                  onClick={() => handleReaction(reply.id, 'dislike')}
                                  className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <ThumbsDown size={12} />
                                  <span>{reply.dislikes_count || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg text-sm transition-colors text-white"
          >
            Trước
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === page 
                      ? 'bg-yellow-500 text-black font-medium' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg text-sm transition-colors text-white"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  )
}