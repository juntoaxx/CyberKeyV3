import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/auth-context'
import { SessionProvider } from '@/contexts/session-context'
import { SessionTimeoutWarning } from '@/components/common/session-timeout-warning'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SessionProvider>
        <Component {...pageProps} />
        <SessionTimeoutWarning />
      </SessionProvider>
    </AuthProvider>
  )
}
