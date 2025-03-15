import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wealth Manager',
  description: 'Track and manage your wealth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <nav className="sticky top-0 z-50 border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50">
            <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center">
              <div className="flex items-center gap-12">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                  Wealth Manager
                </h1>
              </div>
            </div>
          </nav>
          
          <main className="flex-1 relative">
            <div className="max-w-[1600px] mx-auto px-8 py-8">
              {children}
            </div>
          </main>

          <footer className="border-t border-slate-800/50 py-6">
            <div className="max-w-[1600px] mx-auto px-8">
              <div className="text-sm text-slate-500">
                © {new Date().getFullYear()} Wealth Manager
              </div>
            </div>
          </footer>
        </div>
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#34D399',
                secondary: '#1E293B',
              },
            },
            error: {
              iconTheme: {
                primary: '#F87171',
                secondary: '#1E293B',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
