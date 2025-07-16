export default function FeaturesSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-2xl font-semibold">Core Features</h2>
      <ul className="text-left max-w-lg mx-auto list-disc list-inside space-y-2">
        <li>🔍 <b>Smart Matching</b> — AI-powered talent discovery, enhanced by on-chain reputation.</li>
        <li>🔐 <b>Secure Escrow</b> — Protected payments with milestone-based releases.</li>
        <li>🌐 <b>Global Talent Pool</b> — Verifiable identity and trust scores.</li>
        <li>🤝 <b>Collaborative Workspace</b> — Seamless project management tools.</li>
        <li>💰 <b>Multi-currency Support</b> — Work and earn in fiat or crypto.</li>
        <li>⚡ <b>Cross-Chain Interoperability</b></li>
      </ul>
    </div>
  );
}
