import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Groups",
  description: "Manage your expense groups",
};
export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
