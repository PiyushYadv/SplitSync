import type { GroupColor } from "@/src/types/domain";

export const GROUP_COLOR_STYLES: Record<
  GroupColor,
  { dot: string; badge: string }
> = {
  emerald: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  indigo: {
    dot: "bg-indigo-400",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  amber: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  rose: { dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
  violet: {
    dot: "bg-violet-400",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  sky: { dot: "bg-sky-400", badge: "bg-sky-50 text-sky-700 ring-sky-200" },
};

export const GROUP_EMOJIS = [
  "🌍",
  "🏠",
  "🎉",
  "✈️",
  "🍕",
  "⛷️",
  "🎸",
  "🏖️",
  "🚗",
  "💼",
  "🎮",
  "🏕️",
];
export const GROUP_COLORS: Array<{ id: GroupColor; dot: string }> =
  Object.entries(GROUP_COLOR_STYLES).map(([id, styles]) => ({
    id: id as GroupColor,
    dot: styles.dot,
  }));
