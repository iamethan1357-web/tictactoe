import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tic Tac Toe Arena",
  description:
    "Play Tic Tac Toe online with friends or challenge the AI! Multiplayer, 100 levels, daily challenges.",
  keywords: ["tic tac toe", "online game", "multiplayer", "puzzle game"],
  openGraph: {
    title: "Tic Tac Toe Arena",
    description: "Play Tic Tac Toe online with friends or challenge the AI!",
    type: "website",
  },
  robots: { index: true, follow: true },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Patrick Hand', 'Architects Daughter', cursive" }}>
        <div className="graph-bg" aria-hidden="true" />
        <div className="margin-line" aria-hidden="true" />
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </body>
    </html>
  );
}
