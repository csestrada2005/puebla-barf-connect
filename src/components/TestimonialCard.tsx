import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  customerName: string;
  petName?: string;
  petBreed?: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  className?: string;
}

export function TestimonialCard({
  customerName,
  petName,
  petBreed,
  content,
  rating = 5,
  imageUrl,
  className,
}: TestimonialCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "fill-warning text-warning" : "text-muted"
              )}
            />
          ))}
        </div>
        <blockquote className="text-muted-foreground mb-4">
          "{content}"
        </blockquote>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
            {imageUrl ? (
              <img src={imageUrl} alt={customerName} className="h-full w-full rounded-full object-cover" />
            ) : (
              "🐕"
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{customerName}</p>
            {petName && (
              <p className="text-xs text-muted-foreground">
                {petName} {petBreed && `• ${petBreed}`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}