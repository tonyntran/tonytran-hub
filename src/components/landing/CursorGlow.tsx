'use client'

import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    let x = 0, y = 0
    let targetX = 0, targetY = 0
    let visible = false
    let animId = 0

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    function animate() {
      if (!glow) return
      x = lerp(x, targetX, 0.15)
      y = lerp(y, targetY, 0.15)
      glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`
      animId = requestAnimationFrame(animate)
    }

    function onMouseMove(e: MouseEvent) {
      const main = document.querySelector('.landing-main')
      if (!main) return

      const rect = main.getBoundingClientRect()
      const inside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )

      if (inside && !visible) {
        visible = true
        if (glow) glow.style.opacity = '1'
      } else if (!inside && visible) {
        visible = false
        if (glow) glow.style.opacity = '0'
      }

      targetX = e.clientX
      targetY = e.clientY
    }

    animate()
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--landing-accent-bg) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0,
        transition: 'opacity 0.3s ease',
        willChange: 'transform',
      }}
    />
  )
}
