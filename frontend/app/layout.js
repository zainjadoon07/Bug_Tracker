import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// Load local Formula 1 Black font
const f1Font = localFont({
  src: "./fonts/Formula1-Regular-1.ttf",
  variable: "--font-f1",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BugSentinel",
  description: "Cloud-Based Bug Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${f1Font.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-page-bg text-page-fg font-sans transition-colors duration-500">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
