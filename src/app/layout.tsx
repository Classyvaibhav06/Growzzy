import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Growwzzy | Agency Management Platform",
  description: "The all-in-one platform for your agency's team, leads, contracts and finances.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${caveat.variable} ${inter.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
