import './globals.css'

export const metadata = {
  title: 'Sahayak AI - Teaching Assistant',
  description: 'AI-powered teaching assistant for Indian educators',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}