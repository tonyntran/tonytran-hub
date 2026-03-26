import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/components/ThemeProvider'

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>child content</div>
      </ThemeProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
