import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
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
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#04040a] text-[#e8e8f0]`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
