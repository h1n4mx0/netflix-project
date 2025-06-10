import { useEffect, useRef, useState } from 'react'
import ad1 from '../assets/images/ad1.png'
import ad2 from '../assets/images/ad2.png'

export default function SidebarAds() {
  const footerRef = useRef(null)
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0,
      }
    )

    const footerEl = document.querySelector('footer')
    if (footerEl) {
      footerRef.current = footerEl
      observer.observe(footerEl)
    }

    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current)
    }
  }, [])

  const adClass = isFooterVisible ? 'absolute' : 'fixed'

  return (
    <>
      <div className={`${adClass} top-[100px] left-2 z-40 hidden lg:block`}>
        <div className="max-h-[calc(100vh-200px)] flex items-center">
          <img src={ad1} alt="Advertisement" className="w-32 max-h-full object-contain" />
        </div>
      </div>
      <div className={`${adClass} top-[100px] right-2 z-40 hidden lg:block`}>
        <div className="max-h-[calc(100vh-200px)] flex items-center">
          <img src={ad2} alt="Advertisement" className="w-32 max-h-full object-contain" />
        </div>
      </div>
    </>
  )
}
