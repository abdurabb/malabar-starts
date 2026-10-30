export function ScreenStatus({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-24 text-sm text-ink/60">
      {label}
    </div>
  );
}
