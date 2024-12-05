import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SupabaseProvider from './supabase-provider'
import { Navbar } from '@/components/Navbar'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NL WoW Treasure Hunt',
  description: 'A modern treasure hunt in World of Warcraft',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow container mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                {children}
              </main>
              <footer className="bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-sm">
                    &copy; 2024 NL WoW. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

