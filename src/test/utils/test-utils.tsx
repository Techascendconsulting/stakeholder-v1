import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppProvider } from '../../contexts/AppContext'
import { AuthProvider } from '../../contexts/AuthContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
