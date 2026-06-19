import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EmailVerificationBanner } from "@/components/site/EmailVerificationBanner";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerBridge — Find your next opportunity",
  description:
    "Connecting students, graduates, and employers through internships, attachments, graduate programs, and full-time roles across East Africa.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  // Banner only shows on public routes when the user is signed in but
  // email isn't verified. Dashboards still benefit from the banner
  // because the dashboard chrome renders inside `children` and the
  // banner sits above it.
  const showVerify =
    user != null && user.emailVerified == null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Pre-paint theme application for dashboard routes. Reads
            the `cb-theme` cookie and sets `data-dash-theme` on the
            <html> element. Public pages don't render any descendant
            with that selector active (the wrapper only exists under
            /admin, /employer, /dashboard), so this is a no-op for
            them. Avoids a light-flash on dark dashboards. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=document.cookie.match(/(?:^|; )cb-theme=([^;]+)/);var t=m?decodeURIComponent(m[1]):'dark';if(t!=='dark'&&t!=='light')t='dark';document.documentElement.setAttribute('data-dash-theme',t);}catch(e){document.documentElement.setAttribute('data-dash-theme','dark');}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {showVerify ? (
          <EmailVerificationBanner email={user.email} />
        ) : null}
        {children}
        <SiteFooter />
        {/* Floating AI chat — present on every route. */}
        <ChatWidget />
      </body>
    </html>
  );
}