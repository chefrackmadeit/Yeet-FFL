import "./globals.css";
import CountdownBanner from "./components/CountdownBanner";
import NavBar from "./components/NavBar";

export const metadata = {
  title: "YEET FFL",
  description:
    "Home of the YEET fantasy football league — standings, matchups, and league history.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0cc0df",
};

// Applies the saved theme before paint so there's no light/dark flash on load.
const noFlash = `(function(){try{var t=localStorage.getItem('yeet-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>
        <header className="site-header">
          <CountdownBanner />
          <NavBar />
        </header>
        <main>
          <div className="container">{children}</div>
        </main>
        <footer className="footer">
          <div className="container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="footer-logo"
              src="/m-lash-designs.svg"
              alt="M. Lash Designs"
            />
            YEET FFL · data via the Sleeper API · built with Next.js
          </div>
        </footer>
      </body>
    </html>
  );
}
