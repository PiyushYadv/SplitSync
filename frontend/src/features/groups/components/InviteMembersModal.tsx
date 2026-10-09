"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import MemberPicker, { type PickedUser } from "@/src/features/groups/components/MemberPicker";
import { errorMessage } from "@/src/lib/api/client";
import { useInviteMembers } from "@/src/lib/data/mutations";

export default function InviteMembersModal({
  groupId,
  groupName,
  memberIds,
  onClose,
}: {
  groupId: string;
  groupName: string;
  memberIds: string[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<PickedUser[]>([]);
  const invite = useInviteMembers(groupId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Invite to {groupName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              They&apos;ll join once they accept the invitation
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {invite.isSuccess ? (
            <>
              <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                Invitation{invite.data.total === 1 ? "" : "s"} sent to{" "}
                {invite.data.data.map((inv) => inv.invitedUser.name).join(", ")}.
              </p>
              <button
                onClick={onClose}
                className="bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <MemberPicker selected={selected} onChange={setSelected} excludeIds={memberIds} />
              {invite.isError && (
                <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
                  {errorMessage(invite.error, "Couldn't send the invitations")}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={selected.length === 0 || invite.isPending}
                  onClick={() => invite.mutate(selected.map((user) => user.id))}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold"
                >
                  {invite.isPending && <Loader2 size={14} className="animate-spin" />}
                  Send {selected.length > 0 ? selected.length : ""} invite{selected.length === 1 ? "" : "s"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
