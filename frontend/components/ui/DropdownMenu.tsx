"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef(
    ({ className, sideOffset = 4, ...props }, ref) => (
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
              ref={ref}
              sideOffset={sideOffset}
              className={cn("rounded-md p-1 shadow-md", className)}
              {...props}
          />
        </DropdownMenuPrimitive.Portal>
    )
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent };
