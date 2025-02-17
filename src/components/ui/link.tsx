import * as React from "react"
import NextLink from "next/link"
import { cn } from "@/lib/utils"

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NextLink>
>(({ className, ...props }, ref) => (
  <NextLink
    ref={ref}
    className={cn(
      "font-medium text-primary underline-offset-4 hover:underline",
      className
    )}
    {...props}
  />
))
Link.displayName = "Link"

export { Link } 