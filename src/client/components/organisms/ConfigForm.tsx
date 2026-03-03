import { useState } from "react";
import { Settings, Play, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../atoms/Button";
import { Input, Textarea } from "../atoms/Input";
import { Label } from "../atoms/Label";

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
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <aside className="lg:col-span-3 border-r border-[#141414] p-6 space-y-8">
      <section>
        <h2 className="text-xs font-mono uppercase opacity-50 mb-4 flex items-center gap-2">
          <Settings className="w-3 h-3" /> Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Your brand (name or website)</Label>
            <Input
              type="text"
              value={primaryBrand}
              onChange={(e) => setPrimaryBrand(e.target.value)}
              placeholder="e.g. Freshworks or freshworks.com"
            />
            <p className="text-[10px] uppercase opacity-50 mt-1.5">
              We&apos;ll find your category and competitors and run representative queries.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label>Runs per prompt</Label>
              <Input
                type="number"
                min={1}
                value={isNaN(runsPerPrompt) ? "" : runsPerPrompt}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRunsPerPrompt(isNaN(val) ? 1 : Math.max(1, val));
                }}
              />
            </div>
          </div>
          <Button
            variant="primary"
            onClick={onRun}
            disabled={loading || !primaryBrand.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run analysis
          </Button>

          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="text-[10px] font-mono uppercase opacity-60 hover:opacity-100 flex items-center gap-1"
          >
            {advancedOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            Customize competitors & prompts
          </button>

          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <Label>Competitors (comma separated)</Label>
                  <Textarea
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    className="h-20 resize-none"
                    rows={4}
                    placeholder="Leave empty to use discovery"
                  />
                </div>
                <div>
                  <Label>Prompts (one per line)</Label>
                  <Textarea
                    value={prompts}
                    onChange={(e) => setPrompts(e.target.value)}
                    className="h-32 resize-none"
                    rows={6}
                    placeholder="Leave empty to use discovery"
                  />
                </div>
                <p className="text-[10px] uppercase opacity-50">
                  When both are filled, we use these instead of discovery.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
