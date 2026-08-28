export default function Header() {
  const userName = "Kedir Hassen";
  return (
    <header className="bg-[#0078D4] text-white px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
      <h1 className="text-lg font-bold tracking-wide">ServiceNow System</h1>
      <span className="text-sm opacity-90">Welcome, {userName}</span>
    </header>
  );
}
