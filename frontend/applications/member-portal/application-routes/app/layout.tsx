import { Plus_Jakarta_Sans } from 'next/font/google'
import '@/styles/globals.css'
import { AppProviders } from '@/components/providers/AppProviders'

const portalFont = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-portal' })

export const metadata = {
  title: 'PA360 - Prior Authorization Platform',
  description: 'Next-generation prior authorization platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={portalFont.variable}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
