import type { Metadata } from "next";
import { Poppins, Urbanist } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins"
});

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist"
});

export const metadata: Metadata = {
  title: "MERKAMAX Dashboard",
  description: "High-end logistics and supermarket experience"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} ${urbanist.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
