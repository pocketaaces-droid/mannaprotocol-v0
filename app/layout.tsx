import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal + Move Coach — Two science-backed moves | Metabolic Manna",
  description:
    "Free educational tool. Tell us about your meal — see what the research says about food order and post-meal walking. Cited. No medical advice. Plus a free 7-day tracker (PDF).",
  openGraph: {
    title: "Meal + Move Coach — what the research says",
    description:
      "Free educational tool from Metabolic Manna. Food order + post-meal walking, plus a 7-day tracker.",
    type: "website",
    url: "https://protocol.metabolicmanna.com",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
