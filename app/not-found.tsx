import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="wrap" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Not found</h1>
        <p style={{ margin: "1rem 0 2rem" }}>That page isn&rsquo;t here.</p>
        <Link href="/" className="btn-primary btn-gold">Back to the coach</Link>
      </section>
    </main>
  );
}
