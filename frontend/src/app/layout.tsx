import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubShield | Automated Subcontractor Insurance Compliance",
  description: "Eliminate insurance audit penalties. Automated ACORD 25 certificate extraction, verification, and renewal tracking for General Contractors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
