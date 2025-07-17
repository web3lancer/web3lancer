export default function ReputationSlide() {
  const features = [
    { icon: "💯", title: "Transparent Ratings", desc: "On-chain reputation scores" },
    { icon: "👥", title: "Verified Reviews", desc: "Only from real collaborations" },
    { icon: "⚖️", title: "Dispute Resolution", desc: "Fair, transparent arbitration" },
    { icon: "🧮", title: "Decentralized Scoring", desc: "Smart contract automation" },
    { icon: "🛡️", title: "Modular Identity", desc: "Privacy-preserving verification" },
    { icon: "🔗", title: "Permissioned Access", desc: "Trust-based feature access" }
  ];

  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
        Reputation & Trust
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
