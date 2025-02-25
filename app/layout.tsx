import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { Analytics } from "@vercel/analytics/react"


// const inter = Inter({ subsets: ["latin"] });
const dm = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Togethr Store",
  description: "AI powered personalized shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#111111]">
     
      <body className= {dm.className} > 
      {children}
      <Analytics />
      </body>
    </html>
  );
}
