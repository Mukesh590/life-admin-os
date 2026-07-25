import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono, Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Landing-page-only type system (CONTEXT-MASTER Section 7). Scoped to
// `.landing-root` in globals.css so the dashboard's Syne/DM Sans pairing is
// never affected by these variables being present on <body>.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-landing-display',
  weight: ['600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-landing-body',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Life Admin OS - Your AI-powered life operating system",
  description: "Replace 20 fragmented apps with one intelligent system that remembers, reminds, and acts. Manage subscriptions, deadlines, documents, bills, and more.",
  keywords: ["life admin", "personal finance", "subscriptions", "deadlines", "productivity", "AI assistant"],
  openGraph: {
    title: "Life Admin OS",
    description: "Your AI-powered personal chief of staff",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${bricolage.variable} ${inter.variable} font-sans antialiased bg-[#04040a] text-[#e8e8f0]`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-black focus:text-sm focus:font-semibold focus:outline focus:outline-2 focus:outline-offset-2"
        >
          Skip to content
        </a>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
