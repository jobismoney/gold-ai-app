export const metadata = {
  title: 'Gold AI App Pro',
  description: 'วิเคราะห์ทองคำด้วย AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
