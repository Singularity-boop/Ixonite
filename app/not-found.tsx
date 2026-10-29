import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "./components/Chrome";
import { ArrowRight } from "./components/icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section">
        <div className="wrap" style={{ display: "grid", gap: 24, justifyItems: "start" }}>
          <h1 className="d-xl">No such exhibit.</h1>
          <p className="lede">The page you asked for isn&apos;t in the file. It may have moved.</p>
          <Link className="btn btn-primary" href="/">
            Back to the home page <ArrowRight />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
