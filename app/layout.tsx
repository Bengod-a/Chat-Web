import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./AuthProvider";
import { ChatProvider } from "./context/GlobalContext";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import MainLayout from "./MainLayout"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider session={session}>
          <ChatProvider>
            <MainLayout>{children}</MainLayout>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}