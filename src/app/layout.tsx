import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#09090b] text-[#fafafa]`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
