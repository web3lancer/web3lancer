import Image from "next/image";

export default function VisionSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-8 text-white px-8">
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
        <Image 
          src="/logo/web3lancer.jpg" 
          alt="Web3Lancer Logo" 
          width={160} 
          height={160} 
          className="rounded-full shadow-2xl relative z-10 border-4 border-white/30" 
        />
      </div>
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Web3Lancer
      </h1>
      <p className="text-xl max-w-3xl leading-relaxed text-gray-200">
        Bridging traditional freelancing with blockchain innovation. A borderless platform where freelancers and businesses connect, collaborate, and transact with unprecedented transparency in a community reputation-based system.
      </p>
      <div className="flex space-x-4 mt-4">
        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
        <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
}
