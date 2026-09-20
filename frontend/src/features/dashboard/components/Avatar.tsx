import { Member } from "@/src/data/groupData";

type AvatarProps = {
  member: Member;
  size?: number;
};

export default function Avatar({ member, size = 7 }: AvatarProps) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{
        fontSize: size <= 7 ? 11 : 13,
        backgroundColor: member.color,
        width: `${size * 4}px`,
        height: `${size * 4}px`,
      }}
    >
      {member.initials}
    </div>
  );
}
