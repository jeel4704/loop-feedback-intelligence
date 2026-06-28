import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  name: string;
  className?: string;
}

export function Avatar({ initials, name, className }: AvatarProps) {
  return (
    <div
      aria-label={name}
      title={name}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-sm",
        className
      )}
    >
      {initials}
    </div>
  );
}

