import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmberBackground from "@/components/EmberBackground";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain relative min-h-full flex flex-col bg-ink text-silver-2 font-sans">
        <EmberBackground />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
