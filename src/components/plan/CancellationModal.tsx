import { useState } from "react";
import { Heart, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  dogId?: string;
  dogName?: string;
  onCancelled: () => void;
}

const CANCELLATION_REASONS = [
  { id: "expensive", label: "Muy caro", emoji: "💰" },
  { id: "no_need", label: "Ya no lo necesito", emoji: "📦" },
  { id: "delivery", label: "Problemas con la entrega", emoji: "🚚" },
  { id: "diet_change", label: "Cambio de dieta", emoji: "🥗" },
  { id: "deceased", label: "Mi perro ya no está conmigo", emoji: "🌈", sensitive: true },
  { id: "other", label: "Otro motivo", emoji: "💬" },
];

export function CancellationModal({
  open,
  onOpenChange,
  subscriptionId,
  dogId,
  dogName,
  onCancelled,
}: CancellationModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompassionate, setShowCompassionate] = useState(false);

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (value === "deceased") {
      setShowCompassionate(true);
    } else {
      setShowCompassionate(false);
    }
  };

  const handleCancel = async () => {
    if (!reason) {
      toast({
        title: "Selecciona un motivo",
        description: "Por favor, cuéntanos por qué deseas cancelar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Cancel subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (subError) throw subError;

      // If reason is deceased, also update dog profile
      if (reason === "deceased" && dogId) {
        const { error: dogError } = await supabase
          .from("dog_profiles")
          .update({ 
            status: "deceased",
            updated_at: new Date().toISOString(),
          })
          .eq("id", dogId);

        if (dogError) throw dogError;
      }

      toast({
        title: reason === "deceased" 
          ? "Lo sentimos mucho" 
          : "Suscripción cancelada",
        description: reason === "deceased"
          ? `Hemos pausado todo para ${dogName || 'tu perrito'}. Gracias por haber confiado en nosotros.`
          : "Tu suscripción ha sido cancelada correctamente.",
      });

      onCancelled();
      onOpenChange(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "No pudimos procesar tu solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeceasedConfirm = async () => {
    setIsProcessing(true);

    try {
      // Cancel subscription immediately
      const { error: subError } = await supabase
        .from("subscriptions")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (subError) throw subError;

      // Update dog profile status
      if (dogId) {
        const { error: dogError } = await supabase
          .from("dog_profiles")
          .update({ 
            status: "deceased",
            updated_at: new Date().toISOString(),
          })
          .eq("id", dogId);

        if (dogError) throw dogError;
      }

      toast({
        title: "Lo sentimos mucho 💜",
        description: `Hemos pausado todo para ${dogName || 'tu perrito'}. Gracias por haber sido parte de Raw Paw.`,
      });

      onCancelled();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing:", error);
      toast({
        title: "Error",
        description: "No pudimos procesar tu solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Compassionate view for deceased pets
  if (showCompassionate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
              <Heart className="h-8 w-8 text-purple-500" />
            </div>
            <DialogTitle className="text-xl">
              Lo sentimos mucho 💜
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Lamentamos profundamente la pérdida de {dogName || 'tu compañero'}. 
              Vamos a pausar todo inmediatamente para este perrito.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center text-muted-foreground">
            <p className="text-sm">
              No te haremos más preguntas. Tu suscripción y el perfil 
              de {dogName || 'tu perrito'} serán pausados con cariño.
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleDeceasedConfirm}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                "Entendido, gracias"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCompassionate(false)}
              disabled={isProcessing}
              className="w-full"
            >
              Volver atrás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Cancelar Suscripción
          </DialogTitle>
          <DialogDescription>
            Lamentamos que quieras irte. ¿Podrías contarnos por qué?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={reason} onValueChange={handleReasonChange} className="space-y-2">
            {CANCELLATION_REASONS.map((r) => (
              <div key={r.id}>
                <RadioGroupItem value={r.id} id={r.id} className="peer sr-only" />
                <Label
                  htmlFor={r.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                    hover:bg-muted/50 ${r.sensitive ? 'border-purple-200 bg-purple-50/50' : ''}`}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span className={r.sensitive ? 'text-purple-700' : ''}>{r.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {reason === "other" && (
            <div className="mt-4">
              <Label htmlFor="other-reason">Cuéntanos más (opcional)</Label>
              <Textarea
                id="other-reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="¿Qué podríamos mejorar?"
                className="mt-2"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Mantener suscripción
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isProcessing || !reason}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              "Confirmar cancelación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
