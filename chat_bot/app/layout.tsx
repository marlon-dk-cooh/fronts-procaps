import type React from "react"
import type { Metadata } from "next"
import { Inter, Alegreya } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
})

export const metadata: Metadata = {
  title: "Ultra - AI Goal Planning for Students",
  description: "Plan your academic and career goals with AI-powered guidance",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${alegreya.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
