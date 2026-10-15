import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmberBackground from "@/components/EmberBackground";
import WatchProvider from "@/components/watch/WatchProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Oxsnow Studio — Industrializing Basotho Stories",
    template: "%s | Oxsnow Studio",
  },
  description:
    "Oxsnow Studio is a Lesotho-based film studio crafting culturally rooted tales through high cinematic innovation. Films, VOD, production services and IP licensing.",
  keywords: [
    "Basotho film",
    "Lesotho cinema",
    "African cultural storytelling",
    "Oxsnow Studio",
    "Sesotho film",
  ],
  openGraph: {
    title: "Oxsnow Studio — Industrializing Basotho Stories",
    description:
      "Crafting culturally rooted tales through high cinematic innovation.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain relative min-h-full flex flex-col bg-ink text-silver-2 font-sans">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}`}
        </Script>
        <WatchProvider>
          <EmberBackground />
          <Header />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </WatchProvider>
      </body>
    </html>
  );
}
