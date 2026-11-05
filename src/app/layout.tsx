import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { MaterialWebLoader } from "@/components/md-loader";

const robotoFlex = Roboto_Flex({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Objectif B2", template: "%s · Objectif B2" },
  description: "Acompanhamento dos estudos de francês para o TCF Canada.",
};

export const viewport: Viewport = {
  themeColor: "#F9F9FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={robotoFlex.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
      </head>
      <body className="min-h-dvh font-sans">
        <MaterialWebLoader />
        {children}
      </body>
    </html>
  );
}

