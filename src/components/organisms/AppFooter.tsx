interface AppFooterProps {
  responseCount: number | null;
}

export function AppFooter({ responseCount }: AppFooterProps) {
  return (
    <footer className="border-t border-[#141414] px-6 py-2 flex justify-between items-center text-[10px] font-mono uppercase opacity-50">
      <div className="flex gap-6">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> DB Connected
        </span>
        <span>SQLite: visibility.db</span>
      </div>
      <div>{responseCount !== null ? `${responseCount} Responses Analyzed` : "Ready"}</div>
    </footer>
  );
}
