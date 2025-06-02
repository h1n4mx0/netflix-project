// src/pages/LandingPage.jsx

import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden text-white text-center flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/netflix-cover.jpg')"
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-20 max-w-2xl px-4">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 drop-shadow-lg">Welcome to Anieflix</h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-6 drop-shadow max-w-xl mx-auto">
          Unlimited movies, shows and more. Anytime. Anywhere.
        </p>
        <Link
          to="/login"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded text-lg font-semibold transition drop-shadow"
        >
          Login to Start
        </Link>
      </div>
    </div>
  )
}
