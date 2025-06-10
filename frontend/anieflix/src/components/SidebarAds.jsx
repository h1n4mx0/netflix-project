import React from 'react'

export default function SidebarAds() {
  return (
    <>
      <div className="fixed top-1/2 left-0 -translate-y-1/2 z-40 hidden lg:block">
        <img src="https://via.placeholder.com/120x600?text=Ad" alt="Advertisement" className="w-32" />
      </div>
      <div className="fixed top-1/2 right-0 -translate-y-1/2 z-40 hidden lg:block">
        <img src="https://via.placeholder.com/120x600?text=Ad" alt="Advertisement" className="w-32" />
      </div>
    </>
  )
}
