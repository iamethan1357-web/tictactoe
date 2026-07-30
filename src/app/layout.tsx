import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tic Tac Toe Arena",
  description: "Play Tic Tac Toe online with friends or challenge the AI! Multiplayer, 100 levels, daily challenges, and AI opponents.",
  keywords: ["tic tac toe", "online game", "multiplayer", "puzzle game", "brain game", "strategy game"],
  authors: [{ name: "Tic Tac Toe Arena" }],
  openGraph: {
    title: "Tic Tac Toe Arena",
    description: "Play Tic Tac Toe online with friends or challenge the AI!",
    type: "website",
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
