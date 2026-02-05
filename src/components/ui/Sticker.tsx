 import { cn } from "@/lib/utils";
 import { BrandImage } from "./BrandImage";
 
 interface StickerProps {
   src: string;
   alt?: string;
   className?: string;
   priority?: boolean;
 }
 
 /**
  * Sticker - Decorative brand asset component
  * Applies pointer-events-none, select-none, and z-10 by default
  * For use as decorative elements that shouldn't block interactions
  */
 export function Sticker({ src, alt = "", className, priority = false }: StickerProps) {
   return (
     <BrandImage
       src={src}
       alt={alt}
       priority={priority}
       className={cn(
         "pointer-events-none select-none z-10",
         "animate-in fade-in zoom-in duration-700",
         className
       )}
     />
   );
 }