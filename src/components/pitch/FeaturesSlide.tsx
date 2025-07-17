export default function FeaturesSlide() {
  const features = [
    { icon: "🔍", title: "Smart Matching", desc: "AI-powered talent discovery, enhanced by on-chain reputation" },
    { icon: "🔐", title: "Secure Escrow", desc: "Protected payments with milestone-based releases" },
    { icon: "🌐", title: "Global Talent Pool", desc: "Verifiable identity and trust scores" },
    { icon: "🤝", title: "Collaborative Workspace", desc: "Seamless project management tools" },
    { icon: "💰", title: "Multi-currency Support", desc: "Work and earn in fiat or crypto" },
    { icon: "⚡", title: "Cross-Chain Interoperability", desc: "Seamless blockchain transactions" }
  ];

  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Core Features
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
