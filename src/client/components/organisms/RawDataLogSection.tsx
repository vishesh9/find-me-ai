import { useState } from "react";
import { Database, Hash, MessageSquare, Quote, Sparkles, Clock } from "lucide-react";
import { Modal } from "../molecules";
import type { RawResponse } from "../../../types/visibility";

interface RawDataLogSectionProps {
  rawResponses: RawResponse[];
}

export function RawDataLogSection({ rawResponses }: RawDataLogSectionProps) {
  const [viewingResponse, setViewingResponse] = useState<RawResponse | null>(null);

  return (
    <section>
      <div className="flex items-end justify-between mb-6 border-b border-[#141414] pb-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Database className="w-6 h-6 opacity-70" />
          Raw Data Log
        </h2>
        <span className="text-[10px] font-mono opacity-50 uppercase flex items-center gap-1">
          <Quote className="w-3 h-3" /> Latest LLM Responses
        </span>
      </div>
      <div className="border border-[#141414] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#141414] text-[#E4E3E0] text-[10px] uppercase font-bold">
              <th className="p-3 border-r border-[#E4E3E0]/20 w-[120px]">
                <span className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 opacity-80" /> Run
                </span>
              </th>
              <th className="p-3 border-r border-[#E4E3E0]/20">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 opacity-80" /> Prompt
                </span>
              </th>
              <th className="p-3 border-r border-[#E4E3E0]/20 w-[140px]">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 opacity-80" /> Time
                </span>
              </th>
              <th className="p-3">
                <span className="flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 opacity-80" /> Response Preview
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rawResponses.map((resp) => {
              const createdAt = resp.created_at
                ? new Date(resp.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
              return (
                <tr
                  key={resp.id}
                  className="border-b border-[#141414] hover:bg-[#141414]/5 transition-colors group"
                >
                  <td className="p-3 border-r border-[#141414]">
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-[#141414]/10 text-[10px] font-bold group-hover:bg-[#141414]/20">
                        {resp.run_number}
                      </span>
                      <span className="flex items-center gap-1 opacity-80">
                        <Sparkles className="w-3 h-3" />
                        {resp.provider}
                      </span>
                    </span>
                  </td>
                  <td className="p-3 border-r border-[#141414] font-medium max-w-[220px]">
                    <span className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                      <span className="truncate block" title={resp.prompt}>
                        {resp.prompt}
                      </span>
                    </span>
                  </td>
                  <td className="p-3 border-r border-[#141414] text-xs text-[#141414]/70 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 opacity-50" />
                      {createdAt}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setViewingResponse(resp)}
                      className="w-full text-left flex items-start gap-2 font-serif italic text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-inset rounded"
                      title="View full response"
                    >
                      <Quote className="w-3 h-3 mt-0.5 shrink-0 opacity-40" />
                      <span className="line-clamp-1">
                        {resp.response_text.substring(0, 150)}
                        {resp.response_text.length > 150 ? "…" : ""}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!viewingResponse}
        onClose={() => setViewingResponse(null)}
        title="Response"
        maxWidth="2xl"
        ariaLabelledBy="response-modal-title"
        ariaDescribedBy="response-modal-body"
      >
        {viewingResponse && (
          <div id="response-modal-body" className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">Prompt</span>
              <p className="text-sm font-medium border border-[#141414]/20 p-3 bg-[#141414]/5">
                {viewingResponse.prompt}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">Response</span>
              <div className="text-sm font-serif italic border border-[#141414]/20 p-3 bg-[#141414]/5 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                {viewingResponse.response_text}
              </div>
            </div>
            <p className="text-[10px] uppercase opacity-50">
              Run {viewingResponse.run_number} · {viewingResponse.provider}
              {viewingResponse.created_at
                ? ` · ${new Date(viewingResponse.created_at).toLocaleString()}`
                : ""}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
