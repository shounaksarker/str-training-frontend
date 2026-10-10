import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STR Training",
  description: "Underwriting training workspace for short-term rental analysts",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
