export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
};
export type Expense = {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  paidBy: Member;
  splitType: "Equal" | "Exact" | "Percent";
  date: string;
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  groupId: string;
};
export type Settlement = {
  id: string;
  from: Member;
  to: Member;
  amount: number;
  paid: boolean;
  groupId: string;
};
export type Group = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: "active" | "settled";
  statusLabel: string;
  statusColor: string;
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
};

export const ALL_MEMBERS: Record<string, Member> = {
  me: { id: "me", name: "You", initials: "ME", color: "#f43f5e" },
  alice: { id: "alice", name: "Alice Chen", initials: "AC", color: "#10b981" },
  bob: { id: "bob", name: "Bob Tanaka", initials: "BT", color: "#6366f1" },
  charlie: {
    id: "charlie",
    name: "Charlie Roy",
    initials: "CR",
    color: "#f59e0b",
  },
  diana: { id: "diana", name: "Diana Lim", initials: "DL", color: "#ec4899" },
  jamie: { id: "jamie", name: "Jamie Park", initials: "JP", color: "#0ea5e9" },
  sam: { id: "sam", name: "Sam Okafor", initials: "SO", color: "#10b981" },
  alex: { id: "alex", name: "Alex Wu", initials: "AW", color: "#8b5cf6" },
  mia: { id: "mia", name: "Mia Torres", initials: "MT", color: "#ec4899" },
  luca: { id: "luca", name: "Luca Bianchi", initials: "LB", color: "#06b6d4" },
};

const M = ALL_MEMBERS;

export const GROUPS: Group[] = [
  {
    id: "bali",
    name: "Trip to Bali",
    emoji: "🌴",
    color: "emerald",
    status: "active",
    statusLabel: "Active",
    statusColor: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    members: [M.me, M.alice, M.bob, M.charlie, M.diana],
    expenses: [
      {
        id: "b1",
        groupId: "bali",
        title: "Villa at Seminyak",
        category: "Accommodation",
        categoryColor: "#6366f1",
        paidBy: M.alice,
        splitType: "Equal",
        date: "Jul 22, 2025",
        amount: 480.0,
        currency: "USD",
      },
      {
        id: "b2",
        groupId: "bali",
        title: "Sunset dinner at Jimbaran",
        category: "Food & Drink",
        categoryColor: "#f59e0b",
        paidBy: M.bob,
        splitType: "Exact",
        date: "Jul 23, 2025",
        amount: 88.5,
        currency: "USD",
        originalAmount: 1350000,
        originalCurrency: "IDR",
      },
      {
        id: "b3",
        groupId: "bali",
        title: "Scooter rental × 3 days",
        category: "Transport",
        categoryColor: "#3b82f6",
        paidBy: M.me,
        splitType: "Equal",
        date: "Jul 23, 2025",
        amount: 165.0,
        currency: "USD",
      },
      {
        id: "b4",
        groupId: "bali",
        title: "Spa & massage session",
        category: "Wellness",
        categoryColor: "#ec4899",
        paidBy: M.charlie,
        splitType: "Percent",
        date: "Jul 24, 2025",
        amount: 230.0,
        currency: "USD",
        originalAmount: 310,
        originalCurrency: "SGD",
      },
      {
        id: "b5",
        groupId: "bali",
        title: "Tanah Lot temple entry",
        category: "Activities",
        categoryColor: "#10b981",
        paidBy: M.diana,
        splitType: "Equal",
        date: "Jul 24, 2025",
        amount: 85.0,
        currency: "USD",
      },
      {
        id: "b6",
        groupId: "bali",
        title: "Grocery run – Bintang Sari",
        category: "Food & Drink",
        categoryColor: "#f59e0b",
        paidBy: M.alice,
        splitType: "Exact",
        date: "Jul 24, 2025",
        amount: 42.0,
        currency: "USD",
      },
      {
        id: "b7",
        groupId: "bali",
        title: "Surfing lessons at Kuta",
        category: "Activities",
        categoryColor: "#10b981",
        paidBy: M.bob,
        splitType: "Equal",
        date: "Jul 25, 2025",
        amount: 120.0,
        currency: "USD",
      },
      {
        id: "b8",
        groupId: "bali",
        title: "Airport transfer (return)",
        category: "Transport",
        categoryColor: "#3b82f6",
        paidBy: M.me,
        splitType: "Equal",
        date: "Jul 25, 2025",
        amount: 35.0,
        currency: "USD",
        originalAmount: 525000,
        originalCurrency: "IDR",
      },
    ],
    settlements: [
      {
        id: "bs1",
        groupId: "bali",
        from: M.me,
        to: M.alice,
        amount: 45.0,
        paid: false,
      },
      {
        id: "bs2",
        groupId: "bali",
        from: M.charlie,
        to: M.bob,
        amount: 20.5,
        paid: false,
      },
      {
        id: "bs3",
        groupId: "bali",
        from: M.diana,
        to: M.alice,
        amount: 18.0,
        paid: true,
      },
      {
        id: "bs4",
        groupId: "bali",
        from: M.bob,
        to: M.charlie,
        amount: 12.0,
        paid: false,
      },
    ],
  },
  {
    id: "apartment",
    name: "Apartment Bills",
    emoji: "🏠",
    color: "indigo",
    status: "active",
    statusLabel: "Active",
    statusColor: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    members: [M.me, M.jamie, M.sam],
    expenses: [
      {
        id: "a1",
        groupId: "apartment",
        title: "Rent — July",
        category: "Rent",
        categoryColor: "#6366f1",
        paidBy: M.me,
        splitType: "Equal",
        date: "Jul 1, 2025",
        amount: 2100.0,
        currency: "USD",
      },
      {
        id: "a2",
        groupId: "apartment",
        title: "Electricity bill",
        category: "Utilities",
        categoryColor: "#f59e0b",
        paidBy: M.jamie,
        splitType: "Equal",
        date: "Jul 3, 2025",
        amount: 84.0,
        currency: "USD",
      },
      {
        id: "a3",
        groupId: "apartment",
        title: "Internet subscription",
        category: "Utilities",
        categoryColor: "#f59e0b",
        paidBy: M.sam,
        splitType: "Equal",
        date: "Jul 5, 2025",
        amount: 55.0,
        currency: "USD",
      },
      {
        id: "a4",
        groupId: "apartment",
        title: "Grocery run",
        category: "Food & Drink",
        categoryColor: "#f59e0b",
        paidBy: M.me,
        splitType: "Exact",
        date: "Jul 8, 2025",
        amount: 143.0,
        currency: "USD",
      },
      {
        id: "a5",
        groupId: "apartment",
        title: "Cleaning supplies",
        category: "Home",
        categoryColor: "#10b981",
        paidBy: M.jamie,
        splitType: "Equal",
        date: "Jul 10, 2025",
        amount: 28.0,
        currency: "USD",
      },
    ],
    settlements: [
      {
        id: "as1",
        groupId: "apartment",
        from: M.me,
        to: M.jamie,
        amount: 18.33,
        paid: false,
      },
      {
        id: "as2",
        groupId: "apartment",
        from: M.sam,
        to: M.me,
        amount: 47.67,
        paid: true,
      },
    ],
  },
  {
    id: "ski",
    name: "Ski Trip 2025",
    emoji: "⛷️",
    color: "amber",
    status: "settled",
    statusLabel: "Settled",
    statusColor: "bg-slate-100 text-slate-500 ring-slate-200",
    members: [M.me, M.alex, M.mia, M.luca],
    expenses: [
      {
        id: "k1",
        groupId: "ski",
        title: "Chalet rental (3 nights)",
        category: "Accommodation",
        categoryColor: "#6366f1",
        paidBy: M.alex,
        splitType: "Equal",
        date: "Mar 7, 2025",
        amount: 840.0,
        currency: "USD",
      },
      {
        id: "k2",
        groupId: "ski",
        title: "Ski pass (group)",
        category: "Activities",
        categoryColor: "#10b981",
        paidBy: M.me,
        splitType: "Equal",
        date: "Mar 7, 2025",
        amount: 320.0,
        currency: "USD",
      },
      {
        id: "k3",
        groupId: "ski",
        title: "Equipment rental",
        category: "Activities",
        categoryColor: "#10b981",
        paidBy: M.mia,
        splitType: "Equal",
        date: "Mar 8, 2025",
        amount: 180.0,
        currency: "USD",
      },
      {
        id: "k4",
        groupId: "ski",
        title: "Fondue dinner",
        category: "Food & Drink",
        categoryColor: "#f59e0b",
        paidBy: M.luca,
        splitType: "Equal",
        date: "Mar 8, 2025",
        amount: 120.0,
        currency: "USD",
      },
    ],
    settlements: [
      {
        id: "ks1",
        groupId: "ski",
        from: M.me,
        to: M.alex,
        amount: 155.0,
        paid: true,
      },
      {
        id: "ks2",
        groupId: "ski",
        from: M.mia,
        to: M.alex,
        amount: 65.0,
        paid: true,
      },
      {
        id: "ks3",
        groupId: "ski",
        from: M.luca,
        to: M.me,
        amount: 35.0,
        paid: true,
      },
    ],
  },
];

export const ALL_EXPENSES: Expense[] = GROUPS.flatMap((g) => g.expenses);
export const ALL_SETTLEMENTS: Settlement[] = GROUPS.flatMap(
  (g) => g.settlements,
);

// Derived helpers
export function getGroupById(id: string): Group {
  return GROUPS.find((g) => g.id === id) ?? GROUPS[0];
}

export function calcNetBalance(
  expenses: Expense[],
  settlements: Settlement[],
  memberId = "me",
): number {
  const paid = expenses
    .filter((e) => e.paidBy.id === memberId)
    .reduce((s, e) => s + e.amount, 0);
  const share = expenses.reduce(
    (s, e) =>
      s +
      e.amount / (GROUPS.find((g) => g.id === e.groupId)?.members.length ?? 1),
    0,
  );
  return parseFloat((paid - share).toFixed(2));
}

// Mock friends & search users for the new-group modal
export type UserProfile = {
  id: string;
  name: string;
  username: string;
  initials: string;
  color: string;
  mutual?: number;
};

export const FRIENDS: UserProfile[] = [
  {
    id: "alice",
    name: "Alice Chen",
    username: "@alice.chen",
    initials: "AC",
    color: "#10b981",
    mutual: 3,
  },
  {
    id: "bob",
    name: "Bob Tanaka",
    username: "@bobtanaka",
    initials: "BT",
    color: "#6366f1",
    mutual: 2,
  },
  {
    id: "charlie",
    name: "Charlie Roy",
    username: "@charlieroyx",
    initials: "CR",
    color: "#f59e0b",
    mutual: 5,
  },
  {
    id: "diana",
    name: "Diana Lim",
    username: "@diana_lim",
    initials: "DL",
    color: "#ec4899",
    mutual: 1,
  },
  {
    id: "jamie",
    name: "Jamie Park",
    username: "@jamiepark99",
    initials: "JP",
    color: "#0ea5e9",
    mutual: 4,
  },
  {
    id: "sam",
    name: "Sam Okafor",
    username: "@samokafor",
    initials: "SO",
    color: "#10b981",
    mutual: 2,
  },
];

export const SEARCH_USERS: UserProfile[] = [
  ...FRIENDS,
  {
    id: "alex",
    name: "Alex Wu",
    username: "@alexwu",
    initials: "AW",
    color: "#8b5cf6",
  },
  {
    id: "mia",
    name: "Mia Torres",
    username: "@mia.torres",
    initials: "MT",
    color: "#ec4899",
  },
  {
    id: "luca",
    name: "Luca Bianchi",
    username: "@lucabianchi",
    initials: "LB",
    color: "#06b6d4",
  },
  {
    id: "priya",
    name: "Priya Nair",
    username: "@priyanair",
    initials: "PN",
    color: "#84cc16",
  },
  {
    id: "kai",
    name: "Kai Nguyen",
    username: "@kai.nguyen",
    initials: "KN",
    color: "#f97316",
  },
];

// Mock pending invitations
export type Invitation = {
  id: string;
  groupName: string;
  emoji: string;
  invitedBy: string;
  inviterInitials: string;
  inviterColor: string;
  memberCount: number;
  preview: string;
};

export const PENDING_INVITATIONS: Invitation[] = [
  {
    id: "inv1",
    groupName: "Lisbon Trip 2026",
    emoji: "🇵🇹",
    invitedBy: "Priya Nair",
    inviterInitials: "PN",
    inviterColor: "#84cc16",
    memberCount: 6,
    preview: "Flight, hotels, food…",
  },
  {
    id: "inv2",
    groupName: "Office Lunch Pool",
    emoji: "🍱",
    invitedBy: "Kai Nguyen",
    inviterInitials: "KN",
    inviterColor: "#f97316",
    memberCount: 8,
    preview: "Weekly lunch splits",
  },
];
