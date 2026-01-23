import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AuthModal from "./components/modals/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PrimeStudio - Autonomous Video Generation Platform",
  description: "Generate stunning AI videos from text or images. Pay per generation with USDC. No subscriptions, no middlemen. Pure Web3 magic.",
  icons: {
    icon: [
      { url: '/assets/images/prime.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/images/prime.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/images/prime.png', sizes: 'any' },
    ],
    shortcut: '/assets/images/prime.png',
    apple: [
      { url: '/assets/images/prime.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
