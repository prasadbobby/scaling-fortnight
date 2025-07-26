import './globals.css'

export const metadata = {
  title: 'Sahayak AI - Teaching Assistant',
  description: 'AI-powered teaching assistant for Indian educators',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}