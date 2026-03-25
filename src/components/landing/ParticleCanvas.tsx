'use client'

import { useRef, useEffect, useCallback } from 'react'

const PARTICLE_COUNT = 400
const CONNECT_DIST = 120
const MOUSE_RADIUS = 220
const REPULSE_DIST = 18
const MAX_SPEED = 2.5
const MAX_CONNECTIONS = 600

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
  const colorRef = useRef('224, 155, 108')

  const createParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.45 + 0.12,
    }))
  }, [])

  const readParticleColor = useCallback(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--landing-particle-rgb')
      .trim()
    if (raw) colorRef.current = raw
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

      // Connecting lines (capped to prevent lag when particles clump)
      let connCount = 0
      ctx!.strokeStyle = `rgba(${colorRef.current}, 0.10)`
      ctx!.lineWidth = 0.5
      for (let i = 0; i < particles.length && connCount < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < particles.length && connCount < MAX_CONNECTIONS; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy
          if (distSq < CONNECT_DIST * CONNECT_DIST) {
            const dist = Math.sqrt(distSq)
            const alpha = (1 - dist / CONNECT_DIST) * 0.10
            ctx!.strokeStyle = `rgba(${colorRef.current}, ${alpha})`
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.stroke()
            connCount++
          }
        }
      }

      // Collect particles near the mouse for targeted repulsion
      const nearMouse: number[] = []
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS) nearMouse.push(i)
      }

      // Repulsion only among particles clustered near the cursor
      for (let a = 0; a < nearMouse.length; a++) {
        for (let b = a + 1; b < nearMouse.length; b++) {
          const p = particles[nearMouse[a]]
          const q = particles[nearMouse[b]]
          const rx = p.x - q.x
          const ry = p.y - q.y
          const rDistSq = rx * rx + ry * ry
          if (rDistSq < REPULSE_DIST * REPULSE_DIST && rDistSq > 0.01) {
            const rDist = Math.sqrt(rDistSq)
            const push = (REPULSE_DIST - rDist) / REPULSE_DIST * 0.3
            const nx = rx / rDist
            const ny = ry / rDist
            p.vx += nx * push
            p.vy += ny * push
            q.vx -= nx * push
            q.vy -= ny * push
          }
        }
      }

      // Particles + physics — attract toward mouse
      for (const p of particles) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 5) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
          p.vx += (dx / dist) * force * 0.18
          p.vy += (dy / dist) * force * 0.18
        }

        p.vx *= 0.985
        p.vy *= 0.985
        p.vx += (Math.random() - 0.5) * 0.015
        p.vy += (Math.random() - 0.5) * 0.015

        // Velocity cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED
          p.vy = (p.vy / speed) * MAX_SPEED
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${colorRef.current}, ${p.alpha})`
        ctx!.fill()
      }

      // Mouse glow
      if (mouse.x > 0) {
        const grd = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 140)
        grd.addColorStop(0, `rgba(${colorRef.current}, 0.05)`)
        grd.addColorStop(1, 'transparent')
        ctx!.fillStyle = grd
        ctx!.fillRect(mouse.x - 140, mouse.y - 140, 280, 280)
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

    readParticleColor()

    // Watch for theme class changes on <html>
    const observer = new MutationObserver(() => readParticleColor())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    draw()

    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [createParticles, readParticleColor])

  return <canvas ref={canvasRef} />
}
