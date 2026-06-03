// app/layout.js
import './globals.css'

export const metadata = {
  title: 'ELMT.Store',
  description: 'The Official Element United Store',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
