import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 mt-12">
     <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left items-start">
        {/* Logo */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src="/anie_logo.svg"
            alt="Logo Anieflix"
            className="h-12 mb-4"
          />
          <p className="text-sm text-gray-400">
            Anieflix – Cánh cổng dẫn bạn vào thế giới điện ảnh, drama và chương trình thực tế.
          </p>
        </div>

        {/* Navigation links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Khám phá</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="/" className="hover:text-white">Trang chủ</a></li>
            <li><a href="/browse/movies" className="hover:text-white">Phim</a></li>
            <li><a href="/browse/shows" className="hover:text-white">Chương trình</a></li>
            <li><a href="/profile" className="hover:text-white">Tài khoản</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-3">Hỗ trợ</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="/faq" className="hover:text-white">Câu hỏi thường gặp</a></li>
            <li><a href="/contact" className="hover:text-white">Liên hệ</a></li>
            <li><a href="/terms" className="hover:text-white">Điều khoản sử dụng</a></li>
            <li><a href="/privacy" className="hover:text-white">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-white font-semibold mb-3">Kết nối</h3>
          <div className="flex space-x-4 text-gray-400 text-xl">
            <a href="#"><FaFacebookF className="hover:text-white" /></a>
            <a href="#"><FaInstagram className="hover:text-white" /></a>
            <a href="#"><FaTwitter className="hover:text-white" /></a>
            <a href="#"><FaYoutube className="hover:text-white" /></a>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Anieflix. Thuộc quyền sở hữu của h1n4m.
      </div>
    </footer>
  );
}
