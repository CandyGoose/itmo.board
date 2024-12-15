"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

const Toggle = React.forwardRef<
    React.ElementRef<typeof TogglePrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ ...props }, ref) => (
    <TogglePrimitive.Root ref={ref} {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
