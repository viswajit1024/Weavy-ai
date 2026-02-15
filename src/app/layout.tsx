import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Weavy AI - LLM Workflow Builder",
  description: "Build powerful AI workflows with visual programming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#8b5cf6',
          colorBackground: '#141414',
          colorInputBackground: '#0a0a0a',
          colorText: '#ffffff',
          colorTextSecondary: '#a0a0a0',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}