import { useState } from "react";
import { cn } from "@/lib/utils";

interface BrandImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function BrandImage({ src, alt, className, priority = false }: BrandImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      onLoad={() => setIsLoaded(true)}
      className={cn(
        "transition-all duration-500 ease-out",
        !isLoaded && "blur-sm opacity-80",
        isLoaded && "blur-0 opacity-100",
        className
      )}
    />
  );
}
