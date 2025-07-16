export default function DemoSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h2 className="text-2xl font-semibold">See It In Action</h2>
      {/* Optionally remove external links if not desired in the core pitch */}
      <a href="https://doc.storydoc.ai/tgKIKu" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
        📄 Pitch Deck (Storydoc)
      </a>
      <a href="https://youtube.com/watch?v=VwpeeR8MMG8" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
        ▶️ Demo Video
      </a>
    </div>
  );
}
