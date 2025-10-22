// app/layout.js
import { Geist, Geist_Mono, Oswald } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200","300","400","500","600","700"],
  display: "optional", // evita warning de font-display
})

export const metadata = {
  title: "Sistema de Atendimento de Leads",
  description: "Sistema de Atendimento de Leads com IA",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Fonte de Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0&display=optional"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
