import type { Notification } from "@/src/types/domain";

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "expense",
    title: "Alice added a new expense",
    desc: "Villa at Seminyak · $480.00",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    type: "settlement",
    title: "Bob Tanaka paid you back",
    desc: "$20.50 · Trip to Bali",
    time: "1h ago",
    read: false,
  },
  {
    id: "n3",
    type: "invite",
    title: "Diana Lim invited you",
    desc: "Ski Trip 2026 · 4 members",
    time: "3h ago",
    read: false,
  },
  {
    id: "n4",
    type: "reminder",
    title: "You owe Jamie Park",
    desc: "$18.33 · Apartment Bills",
    time: "1d ago",
    read: true,
  },
  {
    id: "n5",
    type: "expense",
    title: "Charlie added an expense",
    desc: "Spa & massage session · $230.00",
    time: "2d ago",
    read: true,
  },
];
