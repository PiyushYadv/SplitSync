"use client";

import type { Member } from "@/src/data/groupData";
import Avatar from "./Avatar";

type Split = {
  on: boolean;
  pct: number;
};

type SplitTableProps = {
  members: Member[];
  splits: Record<string, Split>;
  scanned: boolean;
  onToggle: (id: string) => void;
};

export default function SplitTable({
  members,
  splits,
  scanned,
  onToggle,
}: SplitTableProps) {
  const splitCount = Object.values(splits).filter((v) => v.on).length;

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {["Member", "In", "Share", "Amount"].map((heading) => (
              <th
                key={heading}
                className={`px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${
                  heading === "In"
                    ? "text-center w-10"
                    : heading === "Amount" || heading === "Share"
                      ? "text-right"
                      : "text-left"
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {members.map((member) => {
            const split = splits[member.id];

            const amount =
              scanned && split.on ? (83.05 / splitCount).toFixed(2) : "—";

            return (
              <tr
                key={member.id}
                className={`border-b border-slate-100 last:border-0 ${
                  !split.on ? "opacity-40" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar member={member} size={5} />

                    <span className="text-slate-700 font-medium">
                      {member.name}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={split.on}
                    onChange={() => onToggle(member.id)}
                    className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                  />
                </td>

                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={split.on ? split.pct : 0}
                      disabled={!split.on}
                      className="w-16 accent-indigo-600"
                      onChange={() => {}}
                    />

                    <span className="text-slate-600 w-8 text-right">
                      {split.on ? `${split.pct}%` : "0%"}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-right font-semibold text-slate-900">
                  ${amount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
