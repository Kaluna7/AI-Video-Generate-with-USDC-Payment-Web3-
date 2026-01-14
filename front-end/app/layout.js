import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AuthModal from "./components/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "V3 VideoGen AI - Autonomous Video Generation Platform",
  description: "Generate stunning AI videos from text or images. Pay per generation with USDC. No subscriptions, no middlemen. Pure Web3 magic.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
