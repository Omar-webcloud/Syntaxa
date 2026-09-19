import PrivacyPolicy from "@/components/PrivacyPolicy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Syntaxa",
  description: "Privacy policy, data protection guidelines, and creator credits for Syntaxa English Grammar Quiz.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <PrivacyPolicy />
    </main>
  );
}
