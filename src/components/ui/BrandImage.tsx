import { useState } from "react";
import { cn } from "@/lib/utils";

interface BrandImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function BrandImage({ src, alt, className, priority = false }: BrandImageProps) {
  const [isLoaded, setIsLoaded] = useState(priority); // Skip animation for priority images

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      onLoad={() => setIsLoaded(true)}
      className={cn(
        "transition-opacity duration-300 ease-out",
        !isLoaded && "opacity-0",
        isLoaded && "opacity-100",
        className
      )}
    />
  );
}
