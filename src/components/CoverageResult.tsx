import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CoverageResultProps {
  status: "covered" | "not-covered" | "checking";
  zoneName?: string;
  deliveryFee?: number;
  onJoinWaitlist?: () => void;
  className?: string;
}

export function CoverageResult({
  status,
  zoneName,
  deliveryFee = 0,
  onJoinWaitlist,
  className,
}: CoverageResultProps) {
  if (status === "checking") {
    return (
      <Card className={cn("animate-pulse-soft", className)}>
        <CardContent className="pt-6 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground">Verificando cobertura...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "covered") {
    return (
      <Card className={cn("border-success/50 bg-success/5", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-6 w-6" />
            ¡Sí entregamos aquí!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Zona de entrega</p>
            <p className="font-medium">{zoneName}</p>
          </div>
          {deliveryFee > 0 ? (
            <p className="text-sm">
              Costo de envío: <span className="font-medium">${deliveryFee}</span>
            </p>
          ) : (
            <p className="text-sm text-success font-medium">¡Envío gratis!</p>
          )}
          <Button asChild className="w-full">
            <Link to="/tienda">Ver productos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-warning/50 bg-warning/5", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-warning">
          <XCircle className="h-6 w-6" />
          Aún no llegamos aquí
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Estamos expandiendo nuestra cobertura. ¡Únete a la lista de espera para que te avisemos cuando lleguemos a tu zona!
        </p>
        <Button onClick={onJoinWaitlist} variant="outline" className="w-full">
          Unirme a la lista de espera
        </Button>
      </CardContent>
    </Card>
  );
}