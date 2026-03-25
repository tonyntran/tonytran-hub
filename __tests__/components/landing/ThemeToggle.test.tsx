import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-themes
const mockSetTheme = vi.fn()
let mockTheme = 'dark'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockTheme = 'dark'
    mockSetTheme.mockClear()
  })

  it('renders a button', async () => {
    const { ThemeToggle } = await import('@/components/landing/ThemeToggle')
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('calls setTheme with "light" when current theme is dark', async () => {
    const user = userEvent.setup()
    const { ThemeToggle } = await import('@/components/landing/ThemeToggle')
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme with "dark" when current theme is light', async () => {
    mockTheme = 'light'
    const user = userEvent.setup()

    // Re-import to pick up new mock value
    vi.resetModules()
    vi.doMock('next-themes', () => ({
      useTheme: () => ({
        theme: 'light',
        setTheme: mockSetTheme,
      }),
    }))
    const { ThemeToggle } = await import('@/components/landing/ThemeToggle')

    render(<ThemeToggle />)
    await user.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
