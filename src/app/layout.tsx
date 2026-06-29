import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { defaultOgImage, siteUrl } from "@/lib/seo/seo";

const jakartaSans = Plus_Jakarta_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  applicationName: "FitSupplement Store",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitSupplement"
  },
  title: {
    default: "FitSupplement Store",
    template: "%s | FitSupplement Store"
  },
  metadataBase: new URL(siteUrl),
  description:
    "Premium ecommerce platform foundation for protein powders, wellness supplements, and fitness accessories.",
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: "/icon.svg",
    icon: "/icon.svg"
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    description:
      "Shop premium protein powders, creatine, vitamins, wellness supplements, shakers, and fitness accessories.",
    images: [defaultOgImage],
    siteName: "FitSupplement Store",
    title: "FitSupplement Store",
    type: "website",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultOgImage],
    title: "FitSupplement Store"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body className={jakartaSans.variable}>{children}</body>
    </html>
  );
}
