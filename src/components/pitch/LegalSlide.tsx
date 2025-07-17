export default function LegalSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Legal Transparency & Trust
      </h2>
      <div className="max-w-4xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="text-6xl mb-6">⚖️</div>
        <p className="text-xl leading-relaxed text-gray-200">
          Web3Lancer is open-source and decentralized, providing a foundation for legal data, compliance, and transparency tools. Our platform empowers justice innovation and transparent governance globally.
        </p>
        <div className="flex justify-center space-x-8 mt-8">
          <div className="text-center">
            <div className="text-2xl mb-2">🌍</div>
            <p className="text-sm text-gray-300">Global Reach</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔓</div>
            <p className="text-sm text-gray-300">Open Source</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🏛️</div>
            <p className="text-sm text-gray-300">Governance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
