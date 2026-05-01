import './globals.css'

export const metadata = {
  title: 'Gold AI App Pro',
  description: 'วิเคราะห์ทองคำด้วย AI - คิดเหมือน Smart Money',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
