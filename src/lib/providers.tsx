import type { ReactNode } from 'react'
import { AppProvider } from '../app/app-context'
import { AuthProvider } from '../login/auth-context'
import { SubsProvider } from '../subs/subs-context'
import { VideosProvider } from '../videos/videos-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <SubsProvider>
          <VideosProvider>{children}</VideosProvider>
        </SubsProvider>
      </AppProvider>
    </AuthProvider>
  )
}
