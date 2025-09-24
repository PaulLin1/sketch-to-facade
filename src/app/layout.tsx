import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sketch to Facade",
  description: "Generates building facades from sektches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
