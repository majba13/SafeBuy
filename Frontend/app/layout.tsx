import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafeBuy – Bangladesh's Trusted Multi-Vendor Marketplace",
  description:
    "Shop millions of products from verified sellers across Bangladesh. Fast delivery, secure payments, buyer protection.",
  keywords: "ecommerce, bangladesh, online shopping, marketplace, safebuy",
  openGraph: {
    title: "SafeBuy",
    description: "Bangladesh's Trusted Multi-Vendor Marketplace",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
