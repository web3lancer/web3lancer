export default function DemoSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        See It In Action
      </h2>
      <div className="flex flex-col md:flex-row gap-8 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-2xl font-semibold mb-4">Interactive Pitch Deck</h3>
          <p className="text-gray-300 mb-6">Experience our full presentation with animations and detailed insights.</p>
          <a 
            href="https://doc.storydoc.ai/tgKIKu" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105"
          >
            View Pitch Deck
          </a>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
          <div className="text-6xl mb-4">▶️</div>
          <h3 className="text-2xl font-semibold mb-4">Demo Video</h3>
          <p className="text-gray-300 mb-6">Watch our platform in action with live demonstrations and use cases.</p>
          <a 
            href="https://youtube.com/watch?v=VwpeeR8MMG8" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105"
          >
            Watch Demo
          </a>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-lg text-gray-300">Thank you for your attention!</p>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="h-3 w-3 bg-blue-400 rounded-full animate-ping"></div>
          <div className="h-3 w-3 bg-purple-400 rounded-full animate-ping delay-100"></div>
          <div className="h-3 w-3 bg-pink-400 rounded-full animate-ping delay-200"></div>
        </div>
      </div>
    </div>
  );
}
