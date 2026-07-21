import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "YEET FFL",
  description: "Home of the YEET fantasy football league — standings, matchups, and league history.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="container nav-inner">
            <Link href="/" className="brand">
              YEET FFL
            </Link>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/standings">Standings</Link>
              <Link href="/matchups">Matchups</Link>
              <Link href="/history">History</Link>
            </div>
          </div>
        </nav>
        <main>
          <div className="container">{children}</div>
        </main>
        <footer className="footer">
          <div className="container">
            YEET FFL · data via the Sleeper API · built with Next.js
          </div>
        </footer>
      </body>
    </html>
  );
}
