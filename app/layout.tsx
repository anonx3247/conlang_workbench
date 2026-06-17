import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conlang Workbench",
  description: "A web workbench for phonology, grammar, lexicon, and glossary design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
