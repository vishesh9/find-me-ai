import { Database, Trash2, Download } from "lucide-react";
import { Button } from "../atoms";

interface AppHeaderProps {
  onClear: () => void;
  onExport: () => void;
  hasResults: boolean;
}

export function AppHeader({ onClear, onExport, hasResults }: AppHeaderProps) {
  return (
    <header className="border-b border-[#141414] p-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Database className="w-6 h-6" />
          Find AI <span className="text-xs font-mono opacity-50 ml-2">v1.0.0-POC</span>
        </h1>
        <p className="text-sm font-serif italic opacity-60">
          Measuring brand share of voice in LLM-generated answers
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onClear}>
          <Trash2 className="w-4 h-4" /> Clear
        </Button>
        <Button onClick={onExport} disabled={!hasResults}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>
    </header>
  );
}
