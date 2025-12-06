import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { CartProvider } from "./contexts/CartContext";
import { VoiceModeProvider } from "./contexts/VoiceModeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ecommerce Store",
  description: "Your online shopping destination",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <VoiceModeProvider>
          <CartProvider>
            <Sidebar />
            <div className="lg:ml-64">
              {children}
            </div>
          </CartProvider>
        </VoiceModeProvider>
      </body>
    </html>
  );
}
