import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function BenefitCard({ icon: Icon, title, description, className }: BenefitCardProps) {
  return (
    <div className={cn("text-center p-6 rounded-lg bg-card border transition-all hover:shadow-md", className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}