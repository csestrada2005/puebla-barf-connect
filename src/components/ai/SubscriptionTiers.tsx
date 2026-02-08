import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Truck, Crown, Clock, Sparkles, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNavigate } from "react-router-dom";

interface SubscriptionTier {
  id: "monthly" | "annual";
  name: string;
  description: string;
  billingWeeks: number;
  discountPercent: number;
  badge?: string;
  isRecommended?: boolean;
}

interface SubscriptionTiersProps {
  petName: string;
  dailyGrams: number;
  weeklyKg: number;
  pricePerKg: number;
  hasAllergy?: boolean;
  recommendedProtein?: "chicken" | "beef" | "mix";
  onSelectPlan: (planType: "monthly" | "annual", proteinLine?: "pollo" | "res") => void;
  onRestart: () => void;
}

const tiers: SubscriptionTier[] = [
  {
    id: "monthly",
    name: "Plan Mensual",
    description: "Flexibilidad total, pago en efectivo disponible",
    billingWeeks: 4,
    discountPercent: 0,
  },
  {
    id: "annual",
    name: "Plan Anual",
    description: "15% de descuento, solo tarjeta",
    billingWeeks: 52,
    discountPercent: 15,
    badge: "15% OFF",
    isRecommended: true,
  },
];

export function SubscriptionTiers({
  petName,
  dailyGrams,
  weeklyKg,
  pricePerKg,
  hasAllergy = false,
  recommendedProtein = "chicken",
  onSelectPlan,
  onRestart,
}: SubscriptionTiersProps) {
  const navigate = useNavigate();
  const [selectedProteinTier, setSelectedProteinTier] = useState<"economico" | "premium">(
    recommendedProtein === "beef" ? "premium" : "economico"
  );
  
  const showProteinToggle = !hasAllergy;

  const calculatePrice = (tier: SubscriptionTier) => {
    const weeklyPrice = weeklyKg * pricePerKg;
    const totalWeeks = tier.billingWeeks;
    const basePrice = weeklyPrice * totalWeeks;
    const discount = basePrice * (tier.discountPercent / 100);
    return {
      total: Math.round(basePrice - discount),
      weekly: Math.round(weeklyPrice * (1 - tier.discountPercent / 100)),
      savings: Math.round(discount),
    };
  };
  
  const getProteinLine = (): "pollo" | "res" => {
    if (hasAllergy) {
      return recommendedProtein === "beef" ? "res" : "pollo";
    }
    return selectedProteinTier === "premium" ? "res" : "pollo";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Header - Formula Summary */}
      <div className="border-dashed border-2 border-primary rounded-xl p-4 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">Plan Nutricional para {petName}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ración diaria:</span>
            <span className="font-semibold">{dailyGrams}g</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Caja semanal:</span>
            <span className="font-semibold">{weeklyKg.toFixed(1)}kg</span>
          </div>
        </div>
      </div>

      {/* NEW: Protein Tier Toggle (only when no allergy) */}
      {showProteinToggle && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Elige tu línea de proteína</p>
          <ToggleGroup 
            type="single" 
            value={selectedProteinTier} 
            onValueChange={value => value && setSelectedProteinTier(value as "economico" | "premium")} 
            className="w-full grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl"
          >
            <ToggleGroupItem 
              value="economico" 
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm transition-all min-h-[60px]"
            >
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-semibold">Económico</span>
              </div>
              <span className="text-xs text-muted-foreground">BARF Pollo</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="premium" 
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:ring-2 data-[state=on]:ring-amber-500 transition-all min-h-[60px]"
            >
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold">Premium</span>
              </div>
              <span className="text-xs text-muted-foreground">BARF Res</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Delivery Promise */}
      <div className="flex items-center gap-2 justify-center p-3 bg-secondary/50 rounded-xl">
        <Truck className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">
          Recibes tu caja cada semana en tu puerta 🚚
        </span>
      </div>

      {/* Subscription Tiers */}
      <div className="space-y-4">
        {tiers.map((tier, index) => {
          const pricing = calculatePrice(tier);
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative cursor-pointer transition-all hover:shadow-md ${
                  tier.isRecommended
                    ? "border-2 border-primary ring-2 ring-primary/20"
                    : "border"
                }`}
                onClick={() => onSelectPlan(tier.id, getProteinLine())}
              >
                {tier.badge && (
                  <Badge
                    className={`absolute -top-2.5 right-4 ${
                      tier.isRecommended
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {tier.isRecommended && <Crown className="h-3 w-3 mr-1" />}
                    {tier.badge}
                  </Badge>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${pricing.total.toLocaleString("es-MX")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        cada {tier.billingWeeks} semanas
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>${pricing.weekly}/semana</span>
                      </div>
                      {tier.discountPercent > 0 && (
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground border-0">
                          -{tier.discountPercent}%
                        </Badge>
                      )}
                    </div>
                    {pricing.savings > 0 && (
                      <span className="text-primary text-xs font-medium">
                        Ahorras ${pricing.savings.toLocaleString("es-MX")}
                      </span>
                    )}
                  </div>
                  
                  <Button
                    className="w-full mt-4 gap-2"
                    variant={tier.isRecommended ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(tier.id, getProteinLine());
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Suscribirme al {tier.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Benefits List */}
      <div className="p-4 bg-muted/50 rounded-xl space-y-2">
        <p className="font-medium text-sm mb-3">Todos los planes incluyen:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            "Entrega semanal",
            "Sin contratos",
            "Cancela cuando quieras",
            "Soporte WhatsApp",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Restart */}
      <div className="text-center pt-2">
        <Button variant="ghost" size="sm" onClick={onRestart} className="gap-2 text-muted-foreground">
          <RotateCcw className="h-4 w-4" />
          Nueva consulta
        </Button>
        <p className="text-[10px] text-muted-foreground mt-1">
          ⚠️ Consulta a tu veterinario para casos especiales
        </p>
      </div>
    </motion.div>
  );
}
