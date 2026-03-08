import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VerifiedMRR — Revenue Seller Digital Indonesia Terverifikasi',
  description: 'Lihat revenue seller digital Indonesia yang sudah terverifikasi langsung dari payment gateway mereka.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
