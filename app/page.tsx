import { Hero } from "@/components/Hero";
import { EvidenceChips } from "@/components/EvidenceChips";
import { DayForm } from "@/components/DayForm";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <EvidenceChips />
      <DayForm />
      <SiteFooter />
    </main>
  );
}
