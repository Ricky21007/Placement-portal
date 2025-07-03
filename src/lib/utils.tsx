import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as AvatarPrimitive from "@radix-ui/react-avatar"




export function Avatar({ src }: { src: string }) {
  return (
    <AvatarPrimitive.Root className={cn("relative h-10 w-10 rounded-full")}>
      <AvatarPrimitive.Image
        src={src}
        className="h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback className="flex items-center justify-center text-sm bg-gray-200">
        ?
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
