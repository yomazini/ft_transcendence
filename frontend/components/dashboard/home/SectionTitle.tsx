

export default function  SectionTitle({
  children,
  icon: Icon,
  right,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span>{children}</span>
      </div>
      {right}
    </div>
  );
}

