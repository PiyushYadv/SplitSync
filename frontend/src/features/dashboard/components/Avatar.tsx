type AvatarProps = {
  member: { name: string; initials: string; color: string; avatarUrl?: string };
  size?: number;
};

export default function Avatar({ member, size = 7 }: AvatarProps) {
  const px = `${size * 4}px`;
  if (member.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatars are arbitrary external URLs
      <img
        src={member.avatarUrl}
        alt={member.name}
        className="rounded-full object-cover shrink-0"
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        fontSize: size <= 7 ? 11 : 13,
        backgroundColor: member.color,
        width: px,
        height: px,
      }}
      title={member.name}
    >
      {member.initials}
    </div>
  );
}
