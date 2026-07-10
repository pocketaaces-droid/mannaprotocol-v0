import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  style: ["normal", "italic"],
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://protocol.metabolicmanna.com"),
  title: "Manna Protocol — Order your day, steady your blood sugar",
  description:
    "A free, education-only day protocol: your meals resequenced and your walks placed, cited to published research. By Metabolic Manna.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
