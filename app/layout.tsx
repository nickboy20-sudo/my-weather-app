export const metadata = {
  title: 'Vremea',
  description: 'Prognoză meteo precisă',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
    <body>{children}</body>
    </html>
  )
}
