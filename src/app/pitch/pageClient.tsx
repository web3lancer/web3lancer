// This page should not use any layout, sidebar, or header.
"use client";

import PitchDeck from "@/components/pitch/PitchDeck";

export default function PitchPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <PitchDeck />
    </div>
  );
}
