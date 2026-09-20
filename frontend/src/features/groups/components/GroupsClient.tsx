"use client";

import { useMemo, useState } from "react";
import { Bell, Plus, Search, Users, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import type { GroupListItem } from "@/src/features/groups/types";
import GroupCard from "@/src/features/groups/components/GroupCard";
import CreateGroupModal from "@/src/features/groups/components/CreateGroupModal";
import LeaveGroupModal from "@/src/features/groups/components/LeaveGroupModal";
import { createGroup } from "@/src/lib/data/mutations";
import { PENDING_INVITATIONS, type Invitation } from "@/src/data/groupData";

export default function GroupsClient({
  initialGroups,
}: {
  initialGroups: GroupListItem[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<GroupListItem | null>(null);
  const [invitations, setInvitations] =
    useState<Invitation[]>(PENDING_INVITATIONS);
  const [mutationError, setMutationError] = useState<string | null>(null);
  void mutationError;
  const visible = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  );
  const handleCreate = async (group: GroupListItem) => {
    setMutationError(null);
    setGroups((current) => [...current, group]);
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api") {
      try {
        await createGroup({
          name: group.name,
          emoji: group.emoji,
          color: group.color,
          memberIds: [],
        });
      } catch (error) {
        setGroups((current) => current.filter((item) => item.id !== group.id));
        setMutationError(
          error instanceof Error ? error.message : "Unable to create group",
        );
      }
    }
  };
  const active = groups.filter((group) => group.status === "active").length;
  const total = groups.reduce((sum, group) => sum + group.totalSpend, 0);
  const acceptInvitation = (invitation: Invitation) => {
    setInvitations((current) =>
      current.filter((item) => item.id !== invitation.id),
    );
    setGroups((current) => [
      ...current,
      {
        id: invitation.id,
        name: invitation.groupName,
        emoji: invitation.emoji,
        color: "indigo",
        memberCount: invitation.memberCount,
        totalSpend: 0,
        balance: 0,
        status: "active",
        lastActivity: "Just now",
      },
    ]);
  };
  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-400">Workspace</p>
            <h1 className="text-lg font-bold text-slate-900">Groups</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-3.5 py-2 rounded-md"
          >
            <Plus size={15} /> New Group
          </button>
        </div>
        {invitations.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Pending Invitations
              </h2>
              <span className="text-[11px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                {invitations.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-white border border-amber-200 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {invitation.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900">
                        {invitation.groupName}
                      </p>
                      <span className="text-[10px] bg-amber-50 text-amber-700 ring-1 ring-amber-200 font-semibold px-1.5 py-0.5 rounded-full">
                        Invited
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      <span className="font-medium text-slate-600">
                        {invitation.invitedBy}
                      </span>{" "}
                      added you · {invitation.memberCount} members ·{" "}
                      {invitation.preview}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setInvitations((current) =>
                          current.filter((item) => item.id !== invitation.id),
                        )
                      }
                      className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => acceptInvitation(invitation)}
                      className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <Metric icon={Users} label="Active Groups" value={String(active)} />
          <Metric
            icon={TrendingUp}
            label="Total Across Groups"
            value={`$${total.toLocaleString()}`}
          />
          <Metric
            icon={Users}
            label="Total Members"
            value={String(
              groups.reduce((sum, group) => sum + group.memberCount, 0),
            )}
          />
        </div>
        <div className="relative mb-4">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search groups"
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <div className="grid gap-3">
          {visible.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onOpen={() => router.push(`/groups/${group.id}`)}
              onLeave={() => setLeaveTarget(group)}
            />
          ))}
          {visible.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-400">
              No groups found.
            </div>
          )}
        </div>
      </div>
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {leaveTarget && (
        <LeaveGroupModal
          name={leaveTarget.name}
          onClose={() => setLeaveTarget(null)}
          onConfirm={() => {
            setGroups((current) =>
              current.filter((group) => group.id !== leaveTarget.id),
            );
            setLeaveTarget(null);
          }}
        />
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <Icon size={15} className="text-indigo-600 mb-3" />
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
    </div>
  );
}
