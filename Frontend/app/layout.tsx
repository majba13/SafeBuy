import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "SafeBuy | Smart Multi-Vendor Marketplace",
  description:
    "Discover top sellers, flash deals, and secure checkout on SafeBuy. A modern multi-vendor shopping experience.",
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
      <body className={`${inter.variable} ${poppins.variable} antialiased bg-background text-text-primary font-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
