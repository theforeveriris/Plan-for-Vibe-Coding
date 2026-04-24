// 根布局文件
import type { Metadata } from 'next'
import type { Viewport } from 'next'

export const metadata: Metadata = {
  title: 'PGP Vanity Key Miner Backend',
  description: 'Backend API for PGP vanity key mining',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}