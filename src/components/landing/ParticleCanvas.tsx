'use client'

import { useRef, useEffect, useCallback } from 'react'

const PARTICLE_COUNT = 300
const CONNECT_DIST = 140
const MOUSE_RADIUS = 200

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  const createParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0

    function resize() {
      W = canvas!.width = window.innerWidth
      H = canvas!.height = window.innerHeight
      createParticles(W, H)
    }

    function draw() {
      const particles = particlesRef.current
      const mouse = mouseRef.current
      ctx!.clearRect(0, 0, W, H)

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.15
            ctx!.strokeStyle = `rgba(224, 155, 108, ${alpha})`
            ctx!.lineWidth = 0.5
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.stroke()
          }
        }
      }

      // Particles + physics
      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
          const angle = Math.atan2(dy, dx)
          p.vx += Math.cos(angle) * force * 0.8
          p.vy += Math.sin(angle) * force * 0.8
        }

        p.vx *= 0.98
        p.vy *= 0.98
        p.vx += (Math.random() - 0.5) * 0.02
        p.vy += (Math.random() - 0.5) * 0.02
        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(224, 155, 108, ${p.alpha})`
        ctx!.fill()
      }

      // Mouse glow
      if (mouse.x > 0) {
        const grd = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120)
        grd.addColorStop(0, 'rgba(224, 155, 108, 0.04)')
        grd.addColorStop(1, 'transparent')
        ctx!.fillStyle = grd
        ctx!.fillRect(mouse.x - 120, mouse.y - 120, 240, 240)
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    function onMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [createParticles])

  return <canvas ref={canvasRef} />
}
