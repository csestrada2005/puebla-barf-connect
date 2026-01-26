import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dog, Calendar, Package, Repeat, ShoppingCart, 
  ChevronRight, Sparkles, Check, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DogProfile, 
  calculatePlan, 
  getSubscriptionTiers,
  PLAN_DURATIONS,
  PACKAGING_OPTIONS,
} from "@/hooks/usePlanCalculator";

interface PlanBuilderProps {
  dogs: DogProfile[];
  onAddToCart: (plan: PlanBuilderResult) => void;
  onAddDog: () => void;
}

export interface PlanBuilderResult {
  dogId: string;
  dogName: string;
  dailyGrams: number;
  durationDays: 7 | 15;
  packagingSize: '500g' | '1kg';
  isSubscription: boolean;
  subscriptionType?: 'basic' | 'pro';
  totalKg: number;
  bags: { size: string; quantity: number }[];
  subtotal: number;
  finalPrice: number;
}

export function PlanBuilder({ dogs, onAddToCart, onAddDog }: PlanBuilderProps) {
  const activeDogs = dogs.filter(d => d.status !== 'deceased' && d.status !== 'archived');
  
  const [selectedDogId, setSelectedDogId] = useState<string>(activeDogs[0]?.id || "");
  const [duration, setDuration] = useState<7 | 15>(7);
  const [packaging, setPackaging] = useState<'500g' | '1kg'>('1kg');
  const [wantSubscription, setWantSubscription] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'basic' | 'pro'>('basic');
  
  const selectedDog = activeDogs.find(d => d.id === selectedDogId);
  
  const planCalc = useMemo(() => {
    if (!selectedDog) return null;
    return calculatePlan(selectedDog.daily_grams, duration, packaging);
  }, [selectedDog, duration, packaging]);
  
  const subscriptionTiers = useMemo(() => {
    if (!planCalc) return [];
    return getSubscriptionTiers(planCalc.subtotal);
  }, [planCalc]);
  
  const finalPrice = useMemo(() => {
    if (!planCalc) return 0;
    if (!wantSubscription) return planCalc.subtotal;
    const tier = subscriptionTiers.find(t => t.type === subscriptionType);
    return tier?.priceAfterDiscount || planCalc.subtotal;
  }, [planCalc, wantSubscription, subscriptionType, subscriptionTiers]);
  
  const handleContinue = () => {
    if (!selectedDog || !planCalc) return;
    
    onAddToCart({
      dogId: selectedDog.id,
      dogName: selectedDog.name,
      dailyGrams: selectedDog.daily_grams,
      durationDays: duration,
      packagingSize: packaging,
      isSubscription: wantSubscription,
      subscriptionType: wantSubscription ? subscriptionType : undefined,
      totalKg: planCalc.totalKg,
      bags: planCalc.bags.map(b => ({ size: b.size, quantity: b.quantity })),
      subtotal: planCalc.subtotal,
      finalPrice,
    });
  };
  
  if (activeDogs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Dog className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2">No tienes perros registrados</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Primero necesitas crear un perfil nutricional
          </p>
          <Button onClick={onAddDog} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Crear Perfil con El Dogtor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Dog Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">1</span>
            Selecciona a tu perro
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDogs.length === 1 ? (
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">🐕</div>
              <div className="flex-1">
                <p className="font-medium">{activeDogs[0].name}</p>
                <p className="text-sm text-muted-foreground">{activeDogs[0].daily_grams}g/día</p>
              </div>
              <Badge variant="outline">{activeDogs[0].weight_kg}kg</Badge>
            </div>
          ) : (
            <Select value={selectedDogId} onValueChange={setSelectedDogId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un perro" />
              </SelectTrigger>
              <SelectContent>
                {activeDogs.map(dog => (
                  <SelectItem key={dog.id} value={dog.id}>
                    <div className="flex items-center gap-2">
                      <span>🐕</span>
                      <span>{dog.name}</span>
                      <span className="text-muted-foreground">({dog.daily_grams}g/día)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="link" size="sm" onClick={onAddDog} className="mt-2 p-0 h-auto">
            + Agregar otro perro
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Duration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">2</span>
            Duración del plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={duration.toString()}
            onValueChange={(v) => setDuration(Number(v) as 7 | 15)}
            className="grid grid-cols-2 gap-3"
          >
            {PLAN_DURATIONS.map((plan) => (
              <div key={plan.days}>
                <RadioGroupItem value={plan.days.toString()} id={`duration-${plan.days}`} className="peer sr-only" />
                <Label
                  htmlFor={`duration-${plan.days}`}
                  className="flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                    hover:border-muted-foreground/30"
                >
                  <Calendar className="h-6 w-6 mb-2 text-primary" />
                  <span className="font-semibold">{plan.label}</span>
                  <span className="text-xs text-muted-foreground">{plan.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step 3: Packaging */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">3</span>
            Tamaño de paquete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Tu perro come por gramos. Esto solo cambia cuántos paquetes abres.
          </p>
          <RadioGroup
            value={packaging}
            onValueChange={(v) => setPackaging(v as '500g' | '1kg')}
            className="grid grid-cols-2 gap-3"
          >
            {PACKAGING_OPTIONS.map((opt) => (
              <div key={opt.size}>
                <RadioGroupItem value={opt.size} id={`pkg-${opt.size}`} className="peer sr-only" />
                <Label
                  htmlFor={`pkg-${opt.size}`}
                  className="flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                    hover:border-muted-foreground/30"
                >
                  <Package className="h-6 w-6 mb-2 text-primary" />
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{opt.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {/* Bag breakdown preview */}
          {planCalc && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-muted/50 rounded-lg"
            >
              <p className="text-sm font-medium mb-2">Tu pedido incluye:</p>
              <div className="flex flex-wrap gap-2">
                {planCalc.bags.map((bag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    <Package className="h-3 w-3" />
                    {bag.quantity}x {bag.size}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total: {planCalc.totalKg.toFixed(2)}kg ({planCalc.totalGrams}g)
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Subscription Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">4</span>
            ¿Quieres suscribirte?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Repeat className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Suscripción (Opcional)</p>
                <p className="text-sm text-muted-foreground">Recibe automáticamente cada {duration} días</p>
              </div>
            </div>
            <Switch checked={wantSubscription} onCheckedChange={setWantSubscription} />
          </div>
          
          <AnimatePresence>
            {wantSubscription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <RadioGroup
                  value={subscriptionType}
                  onValueChange={(v) => setSubscriptionType(v as 'basic' | 'pro')}
                  className="space-y-3"
                >
                  {subscriptionTiers.map((tier) => (
                    <div key={tier.type}>
                      <RadioGroupItem value={tier.type} id={`sub-${tier.type}`} className="peer sr-only" />
                      <Label
                        htmlFor={`sub-${tier.type}`}
                        className="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                          hover:border-muted-foreground/30"
                      >
                        <div className={`p-2 rounded-lg ${tier.type === 'pro' ? 'bg-yellow-100' : 'bg-primary/10'}`}>
                          {tier.type === 'pro' ? (
                            <Crown className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{tier.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              -{tier.discountPercent}%
                            </Badge>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {tier.benefits.slice(0, 3).map((b, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-primary" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${tier.priceAfterDiscount}</p>
                          <p className="text-xs text-muted-foreground line-through">${planCalc?.subtotal}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!wantSubscription && planCalc && (
            <div className="p-4 border rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Compra única</span>
                <span className="font-bold text-lg">${planCalc.subtotal}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Footer CTA */}
      <div className="sticky bottom-4 z-10">
        <Button 
          onClick={handleContinue} 
          size="lg" 
          className="w-full h-14 text-base font-bold shadow-xl gap-2"
          disabled={!selectedDog}
        >
          <ShoppingCart className="h-5 w-5" />
          Continuar al Pago (${finalPrice})
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
