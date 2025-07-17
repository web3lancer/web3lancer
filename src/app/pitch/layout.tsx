// This layout disables all global app layout (no sidebar, header, etc) for /pitch.
export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
