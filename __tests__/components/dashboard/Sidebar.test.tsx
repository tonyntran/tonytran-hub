import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

// Mock the signOut action
vi.mock('@/lib/actions/auth', () => ({
  signOut: vi.fn(),
}))

import { Sidebar } from '@/components/dashboard/Sidebar'

describe('Sidebar', () => {
  it('renders future module placeholders with icons', () => {
    render(<Sidebar />)

    expect(screen.getByText('Kanban')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('CRM')).toBeInTheDocument()
    expect(screen.getByText('Costs')).toBeInTheDocument()
  })

  it('renders future modules section header', () => {
    render(<Sidebar />)
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })
})
