export default function OnChainSlide() {
  const capabilities = [
    {
      icon: "💸",
      title: "Instant Cross-Border Payments",
      desc: "Eliminate traditional banking delays",
    },
    {
      icon: "🔄",
      title: "Currency Conversion",
      desc: "Seamless exchanges between currencies",
    },
    {
      icon: "📊",
      title: "Financial Inclusion",
      desc: "Banking services for the unbanked",
    },
    {
      icon: "🛡️",
      title: "Transaction Security",
      desc: "Immutable payment records",
    },
    {
      icon: "⚡",
      title: "Low-Cost Microtransactions",
      desc: "Granular payment models",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
        On-Chain Capabilities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        {capabilities.map((cap, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <div className="text-3xl mb-3 animate-pulse">{cap.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
            <p className="text-gray-300 text-sm">{cap.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xl max-w-2xl text-gray-200 mt-6">
        Powered by fast, low-cost, and secure blockchain transactions.
      </p>
    </div>
  );
}
