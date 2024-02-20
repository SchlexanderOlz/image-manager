import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Manager",
  description: "Manages images for your home-requirenments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="p-5 flex flex-row justify-center bg-base-100">
          {children}
        </div>
        <header>
          <Nav></Nav>
        </header>
        <footer>
          <Footer></Footer>
        </footer>
      </body>
    </html>
  );
}
