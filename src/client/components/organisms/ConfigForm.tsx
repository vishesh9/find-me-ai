import { Settings, Play, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, Input, Textarea, Label } from "../atoms";

interface ConfigFormProps {
  primaryBrand: string;
  setPrimaryBrand: (v: string) => void;
  competitors: string;
  setCompetitors: (v: string) => void;
  prompts: string;
  setPrompts: (v: string) => void;
  runsPerPrompt: number;
  setRunsPerPrompt: (v: number) => void;
  loading: boolean;
  error: string | null;
  onRun: () => void;
}

export function ConfigForm({
  primaryBrand,
  setPrimaryBrand,
  competitors,
  setCompetitors,
  prompts,
  setPrompts,
  runsPerPrompt,
  setRunsPerPrompt,
  loading,
  error,
  onRun,
}: ConfigFormProps) {
  return (
    <aside className="lg:col-span-3 border-r border-[#141414] p-6 space-y-8">
      <section>
        <h2 className="text-xs font-mono uppercase opacity-50 mb-4 flex items-center gap-2">
          <Settings className="w-3 h-3" /> Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Primary Brand</Label>
            <Input
              type="text"
              value={primaryBrand}
              onChange={(e) => setPrimaryBrand(e.target.value)}
            />
          </div>
          <div>
            <Label>Competitors (comma separated)</Label>
            <Textarea
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="h-20 resize-none"
              rows={4}
            />
          </div>
          <div>
            <Label>Prompts (one per line)</Label>
            <Textarea
              value={prompts}
              onChange={(e) => setPrompts(e.target.value)}
              className="h-32 resize-none"
              rows={6}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label>Runs/Prompt</Label>
              <Input
                type="number"
                value={isNaN(runsPerPrompt) ? "" : runsPerPrompt}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRunsPerPrompt(isNaN(val) ? 0 : val);
                }}
              />
            </div>
          </div>
          <Button variant="primary" onClick={onRun} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Analysis
          </Button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border border-[#141414] bg-[#141414]/5 space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase">Processing...</span>
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
          <div className="h-1 bg-[#141414]/10 w-full overflow-hidden">
            <motion.div
              className="h-full bg-[#141414]"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </aside>
  );
}
