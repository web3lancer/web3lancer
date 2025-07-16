import Image from "next/image";

export default function VisionSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <Image src="/logo/web3lancer.jpg" alt="Web3Lancer Logo" width={120} height={120} className="rounded-xl" />
      <h1 className="text-3xl font-bold">Web3Lancer</h1>
      <p className="text-lg max-w-xl">
        Bridging traditional freelancing with blockchain innovation. A borderless platform where freelancers and businesses connect, collaborate, and transact with unprecedented transparency in a community reputation-based system.
      </p>
    </div>
  );
}
