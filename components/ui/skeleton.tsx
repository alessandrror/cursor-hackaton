import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/50',
        'bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50',
        'bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
