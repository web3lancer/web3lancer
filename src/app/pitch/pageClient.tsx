// This page should not use any layout, sidebar, or header.
"use client";

import PitchDeck from "@/components/pitch/PitchDeck";

function PitchPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <PitchDeck />
    </div>
  );
}

PitchPageClient.noAppLayout = true;

export default PitchPageClient;
