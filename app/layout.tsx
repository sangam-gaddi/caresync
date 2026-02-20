import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "HealthOS — Your Healthcare Operating System",
  description:
    "An immersive, AI-powered healthcare platform with a 3D interactive body avatar, voice AI Doctor, and real-time health insights.",
  keywords: "healthcare, AI doctor, 3D body, health tracking, medical OS",
  openGraph: {
    title: "HealthOS",
    description: "Your AI-powered Healthcare Operating System",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#080c14" />
      </head>
      <body className="bg-[#080c14] text-white antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0d1421",
              border: "1px solid #1e2a3a",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}
