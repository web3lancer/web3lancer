export default function GetStartedSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-2xl font-semibold">Getting Started</h2>
      <pre className="bg-gray-100 rounded p-4 text-left max-w-lg mx-auto">
        {`git clone https://github.com/web3lancer/web3lancer.git
cd web3lancer
npm install
npm run dev`}
      </pre>
      <p className="text-base">Join us in building the future of work!</p>
    </div>
  );
}
