'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  className?: string
}

export function ThemeToggle({ className = '' }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`landing-theme-toggle ${className}`}
      aria-label="Toggle theme"
      type="button"
    >
      <span className={`landing-theme-toggle-icon ${isDark ? '' : 'landing-theme-toggle-icon-rotated'}`}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  )
}
