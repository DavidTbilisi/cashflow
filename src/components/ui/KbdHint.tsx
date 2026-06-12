export function KbdHint({ k }: { k: string }) {
  return (
    <kbd
      className="inline-block ml-1.5 text-[9px] font-mono px-1 leading-[1.4] align-middle opacity-40"
      style={{ border: '1px solid currentColor', borderRadius: '2px' }}
    >
      {k}
    </kbd>
  )
}
