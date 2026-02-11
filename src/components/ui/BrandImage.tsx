import { useState } from "react";
import { cn } from "@/lib/utils";

interface BrandImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function BrandImage({
  src,
  alt,
  className,
  priority = false,
  ...props
}: BrandImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // @ts-ignore - fetchPriority is not yet in React types
      fetchPriority={priority ? "high" : "auto"}
      onLoad={(e) => {
        setIsLoaded(true);
        props.onLoad?.(e);
      }}
      className={cn(
        "transition-opacity duration-500 ease-out",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}
