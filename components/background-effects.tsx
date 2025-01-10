'use client'

import { useEffect, useRef } from 'react'

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    resize()
    window.addEventListener('resize', resize)

    class Particle {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
      life: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 2 + 1
        this.color = `hsla(${196 + Math.random() * 30}, 80%, 55%, 0.1)`
        this.vx = (Math.random() - 0.5) * 0.2
        this.vy = (Math.random() - 0.5) * 0.2
        this.life = Math.random() * 0.5 + 0.5
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.life -= 0.001

        if (this.life <= 0) {
          this.life = Math.random() * 0.5 + 0.5
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    const particles: Particle[] = []
    const particleCount = 50

    for (let i = 0; i < particleCount; i++) {
      particles.push(
        new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      )
    }

    let gradientAngle = 0
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Rotating gradient background
      const gradient = ctx.createLinearGradient(
        canvas.width / 2,
        0,
        canvas.width / 2,
        canvas.height
      )
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.03)')
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.03)')
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.03)')

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(gradientAngle)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()

      gradientAngle += 0.001

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  )
}

