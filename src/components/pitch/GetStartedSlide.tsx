export default function GetStartedSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent">
        Getting Started
      </h2>
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-3xl">
        <pre className="text-left text-green-400 text-lg font-mono leading-relaxed">
          <code>{`git clone https://github.com/web3lancer/web3lancer.git
cd web3lancer
npm install
npm run dev`}</code>
        </pre>
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-2xl font-semibold">Join us in building the future of work!</p>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg">
          Start Contributing
        </button>
      </div>
    </div>
  );
}
