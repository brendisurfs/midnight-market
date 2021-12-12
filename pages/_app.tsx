import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'

function MyApp({ Component, pageProps }: AppProps) {
  return (
  <div>
    <Component {...pageProps} />
  </div>
  )
}

export default MyApp
