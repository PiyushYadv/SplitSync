"use client";

import { useMemo, useState } from "react";
import { Bell, Plus, Search, Users, TrendingUp, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import GroupCard from "@/src/features/groups/components/GroupCard";
import CreateGroupModal from "@/src/features/groups/components/CreateGroupModal";
import LeaveGroupModal from "@/src/features/groups/components/LeaveGroupModal";
import { errorMessage } from "@/src/lib/api/client";
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useLeaveGroup,
} from "@/src/lib/data/mutations";
import { useDashboard, useGroups, useInvitations } from "@/src/lib/data/queries";
import { formatMoney } from "@/src/lib/format/money";
import type { DashboardData, GroupSummary, Invitation } from "@/src/types/domain";

export default function GroupsClient({
  initialGroups,
  initialInvitations,
  initialDashboard,
}: {
  initialGroups: GroupSummary[];
  initialInvitations: Invitation[];
  initialDashboard: DashboardData;
}) {
  const router = useRouter();
  const { data: groups = initialGroups } = useGroups(initialGroups);
  const { data: invitations = initialInvitations } = useInvitations(initialInvitations);
  // Group totals are in each group's own currency; the dashboard has them converted.
  const { data: dashboard = initialDashboard } = useDashboard(initialDashboard);
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();
  const leaveGroup = useLeaveGroup();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<GroupSummary | null>(null);

  const visible = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  );
  // Settled groups still count; only archived ones drop out.
  const groupCount = groups.filter((group) => group.status !== "archived").length;
  const invitationError = acceptInvitation.error ?? declineInvitation.error;
  const respondingTo = acceptInvitation.isPending
    ? acceptInvitation.variables
    : declineInvitation.isPending
      ? declineInvitation.variables
      : null;

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
            {invitationError && (
              <p className="mb-2 text-xs text-rose-600">
                {errorMessage(invitationError)}
              </p>
            )}
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
                    <p className="text-xs text-slate-400 truncate">
                      <span className="font-medium text-slate-600">
                        {invitation.invitedBy.name}
                      </span>{" "}
                      invited you · {invitation.memberCount} member
                      {invitation.memberCount === 1 ? "" : "s"}
                      {invitation.preview ? ` · ${invitation.preview}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={respondingTo === invitation.id}
                      onClick={() => declineInvitation.mutate(invitation.id)}
                      className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      disabled={respondingTo === invitation.id}
                      onClick={() => acceptInvitation.mutate(invitation.id)}
                      className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg disabled:opacity-50"
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
          <Metric icon={Users} label="Your Groups" value={String(groupCount)} />
          <Metric
            icon={TrendingUp}
            label="Total Across Groups"
            value={formatMoney(dashboard.summary.totalSpend, dashboard.summary.currency)}
          />
          <Metric
            icon={Wallet}
            label="Your Net Balance"
            value={formatMoney(dashboard.summary.netBalance, dashboard.summary.currency)}
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
              onLeave={() => {
                leaveGroup.reset();
                setLeaveTarget(group);
              }}
            />
          ))}
          {visible.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-400">
              {groups.length === 0
                ? "You're not in any groups yet. Create one to start splitting expenses."
                : "No groups match your search."}
            </div>
          )}
        </div>
      </div>
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(group) => {
            setShowCreate(false);
            router.push(`/groups/${group.id}`);
          }}
        />
      )}
      {leaveTarget && (
        <LeaveGroupModal
          name={leaveTarget.name}
          pending={leaveGroup.isPending}
          error={leaveGroup.isError ? errorMessage(leaveGroup.error) : null}
          onClose={() => setLeaveTarget(null)}
          onConfirm={() =>
            leaveGroup.mutate(leaveTarget.id, {
              onSuccess: () => setLeaveTarget(null),
            })
          }
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
