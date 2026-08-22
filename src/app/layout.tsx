import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/provider/providers";
import LayoutShell from "./LayoutShell";
import { Toaster } from "@/components/ui/toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nanasala Peradeniya Campus - LMS Admin",
  description: "Administrative portal for Nanasala Peradeniya Campus LMS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-poppins)">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
          <Toaster/>
        </Providers>
      </body>
    </html>
  );
}
