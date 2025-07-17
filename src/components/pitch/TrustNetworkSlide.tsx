export default function TrustNetworkSlide() {
  const features = [
    { icon: "🎯", title: "Trust Score Analytics", desc: "KYC integration & behavioral scoring" },
    { icon: "🛡️", title: "Sybil Resistance", desc: "One user, one account policy" },
    { icon: "🔐", title: "Compliance Filtering", desc: "Smart access control" },
    { icon: "⚡", title: "Reputation-Based Access", desc: "Dynamic feature permissions" },
    { icon: "🕵️", title: "Zero-Knowledge Privacy", desc: "Private verification methods" }
  ];

  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
        Advanced Trust Network
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
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
