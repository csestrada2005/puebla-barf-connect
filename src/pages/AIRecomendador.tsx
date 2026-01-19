import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Dog, Scale, Calendar, Target, Utensils, ArrowRight, Loader2, Activity, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const breeds = [
  "Chihuahua", "Pug", "French Bulldog", "Beagle", "Cocker Spaniel",
  "Border Collie", "Labrador", "Golden Retriever", "Pastor Alemán",
  "Husky Siberiano", "Rottweiler", "Gran Danés", "Otro / Mestizo"
];

const goals = [
  { value: "premium", label: "Lo mejor para mi perro", icon: "⭐", recommendsRes: true },
  { value: "balance", label: "Balance calidad/precio", icon: "⚖️", recommendsRes: false },
  { value: "health", label: "Mejorar salud general", icon: "❤️", recommendsRes: true },
  { value: "digestion", label: "Mejorar digestión", icon: "🌿", recommendsRes: false },
  { value: "coat", label: "Mejorar pelaje", icon: "✨", recommendsRes: true },
  { value: "energy", label: "Más energía", icon: "⚡", recommendsRes: false },
];

const activityLevels = [
  { value: "low", label: "Baja", description: "Paseos cortos, senior", percentage: 0.025 },
  { value: "normal", label: "Normal", description: "Paseos diarios regulares", percentage: 0.03 },
  { value: "high", label: "Alta", description: "Muy activo, deportista", percentage: 0.04 },
];

const ageRanges = [
  { value: "1-2m", label: "1-2 meses", percentage: 0.10 },
  { value: "3-4m", label: "3-4 meses", percentage: 0.08 },
  { value: "5-6m", label: "5-6 meses", percentage: 0.06 },
  { value: "7-8m", label: "7-8 meses", percentage: 0.04 },
  { value: "9-10m", label: "9-10 meses", percentage: 0.035 },
  { value: "11-12m", label: "11-12 meses", percentage: 0.03 },
  { value: "adult", label: "Adulto (1-7 años)", percentage: null }, // Uses activity level
  { value: "senior", label: "Senior (7+ años)", percentage: 0.025 },
];

// Calculate daily grams based on BARF formula
const calculateDailyGrams = (weight: number, age: string, activity: string): number => {
  const ageData = ageRanges.find(a => a.value === age);
  
  // Puppies have fixed percentages
  if (ageData?.percentage !== null) {
    return Math.round(weight * ageData.percentage * 1000);
  }
  
  // Adults use activity level
  const activityData = activityLevels.find(a => a.value === activity);
  return Math.round(weight * (activityData?.percentage || 0.03) * 1000);
};

export default function AIRecomendador() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRecommendation } = useRecommendation();
  const { addItem } = useCart();
  
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    petName: "",
    breed: "",
    weight: "",
    age: "",
    activity: "",
    goal: "",
  });

  const { data: products } = useQuery({
    queryKey: ["products-for-recommendation"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_subscription", false);
      return data || [];
    },
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      analyzeAndRecommend();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.petName && formData.breed;
      case 2:
        return formData.weight && formData.age && (formData.age !== "adult" || formData.activity);
      case 3:
        return formData.goal;
      default:
        return false;
    }
  };

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const weight = parseFloat(formData.weight);
    const dailyGrams = calculateDailyGrams(weight, formData.age, formData.activity);
    const monthlyGrams = dailyGrams * 30;
    
    // Determine protein line based on goal
    const goalData = goals.find(g => g.value === formData.goal);
    const recommendedProtein = goalData?.recommendsRes ? "res" : "pollo";
    
    // Determine presentation based on monthly consumption
    // If monthly > 10kg, recommend 1kg packs, otherwise 500g
    const recommendedPresentation = monthlyGrams > 10000 ? "1kg" : "500g";
    
    // Find matching product
    const recommendedProduct = products?.find(
      p => p.protein_line === recommendedProtein && p.presentation === recommendedPresentation
    );

    // Calculate packages per month
    const gramsPerPack = recommendedPresentation === "1kg" ? 1000 : 500;
    const packagesPerMonth = Math.ceil(monthlyGrams / gramsPerPack);

    const isPuppy = !["adult", "senior"].includes(formData.age);
    
    const aiRecommendation = {
      petName: formData.petName,
      breed: formData.breed,
      weight: weight,
      age: formData.age,
      activity: formData.activity,
      goal: goalData?.label,
      dailyGrams,
      monthlyGrams,
      packagesPerMonth,
      recommendedProtein,
      recommendedPresentation,
      product: recommendedProduct,
      isPuppy,
      message: `Para ${formData.petName}, un ${formData.breed} de ${weight}kg, recomendamos **${dailyGrams}g diarios** de nuestra línea ${recommendedProtein === "res" ? "Res Premium" : "Pollo"}. ${
        isPuppy 
          ? "Al ser cachorro, las porciones son mayores para su crecimiento." 
          : `Con su nivel de actividad ${formData.activity === "high" ? "alta" : formData.activity === "low" ? "baja" : "normal"}, esta porción es ideal.`
      } Necesitarás aproximadamente **${packagesPerMonth} paquetes de ${recommendedPresentation}** al mes.`,
      createdAt: new Date().toISOString(),
    };
    
    setRecommendation(aiRecommendation);
    setResult(aiRecommendation);
    setIsAnalyzing(false);
  };

  const handleAddToCart = () => {
    if (!result?.product) return;
    
    addItem({
      id: result.product.id,
      name: result.product.name,
      price: Number(result.product.price),
      imageUrl: result.product.image_url || undefined,
    });
    
    toast({
      title: "¡Agregado al carrito!",
      description: `${result.product.name} para ${result.petName}`,
    });
    
    navigate("/carrito");
  };

  if (isAnalyzing) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-16 w-16 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Analizando perfil de {formData.petName}...</h2>
            <p className="text-muted-foreground">
              Calculando porciones ideales con la fórmula BARF.
            </p>
            <div className="mt-8 space-y-2 text-sm text-muted-foreground">
              <p className="animate-pulse">🔍 Analizando necesidades nutricionales...</p>
              <p className="animate-pulse">📊 Calculando gramos diarios...</p>
              <p className="animate-pulse">🎯 Seleccionando el mejor producto...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (result) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">¡Listo! Tu plan personalizado</h1>
              <p className="text-muted-foreground">
                Basado en el perfil de {result.petName}
              </p>
            </div>

            {/* Disclaimer */}
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta recomendación es orientativa. <strong>No sustituye la consulta con un veterinario</strong> para casos especiales o condiciones de salud.
              </AlertDescription>
            </Alert>

            {/* Main recommendation */}
            <Card className="mb-6 border-primary border-2">
              <CardHeader className="bg-primary/5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-primary">
                      {result.product?.name || `BARF ${result.recommendedProtein === "res" ? "Res" : "Pollo"} ${result.recommendedPresentation}`}
                    </CardTitle>
                    <CardDescription>Plan recomendado para {result.petName}</CardDescription>
                  </div>
                  {result.product && (
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        ${Number(result.product.price).toLocaleString("es-MX")}
                      </p>
                      <p className="text-sm text-muted-foreground">por paquete</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{
                    __html: result.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-card border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{result.dailyGrams}g</p>
                    <p className="text-xs text-muted-foreground">por día</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">2</p>
                    <p className="text-xs text-muted-foreground">porciones</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{result.packagesPerMonth}</p>
                    <p className="text-xs text-muted-foreground">paquetes/mes</p>
                  </div>
                </div>

                {result.product && (
                  <Button onClick={handleAddToCart} size="lg" className="w-full gap-2">
                    Agregar al carrito
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Pet profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perfil de {result.petName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Dog className="h-4 w-4 text-muted-foreground" />
                    <span>{result.breed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <span>{result.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{ageRanges.find(a => a.value === result.age)?.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{result.goal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => { setResult(null); setStep(1); }}>
                Volver a calcular
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isAdult = formData.age === "adult";

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Recomendador AI</h1>
            <p className="text-muted-foreground">
              Cuéntanos sobre tu perro y calcularemos su plan perfecto
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "¿Cómo se llama tu perro?"}
                {step === 2 && "Datos físicos"}
                {step === 3 && "Objetivo principal"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Información básica de tu mascota"}
                {step === 2 && "Esto nos ayuda a calcular las porciones exactas"}
                {step === 3 && "Para personalizar la recomendación de línea"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="petName">Nombre de tu perro</Label>
                    <Input
                      id="petName"
                      placeholder="Ej: Max, Luna, Rocky..."
                      value={formData.petName}
                      onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Raza</Label>
                    <Select
                      value={formData.breed}
                      onValueChange={(value) => setFormData({ ...formData, breed: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la raza" />
                      </SelectTrigger>
                      <SelectContent>
                        {breeds.map((breed) => (
                          <SelectItem key={breed} value={breed}>
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ej: 15"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Edad</Label>
                    <Select
                      value={formData.age}
                      onValueChange={(value) => setFormData({ ...formData, age: value, activity: value === "adult" ? "" : "normal" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la edad" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map((age) => (
                          <SelectItem key={age.value} value={age.value}>
                            {age.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isAdult && (
                    <div className="space-y-2">
                      <Label>Nivel de actividad</Label>
                      <RadioGroup
                        value={formData.activity}
                        onValueChange={(value) => setFormData({ ...formData, activity: value })}
                        className="space-y-2"
                      >
                        {activityLevels.map((level) => (
                          <div key={level.value}>
                            <RadioGroupItem
                              value={level.value}
                              id={level.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={level.value}
                              className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                            >
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{level.label}</span>
                                <span className="text-sm text-muted-foreground ml-2">{level.description}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <Label>¿Qué buscas para tu perro?</Label>
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) => setFormData({ ...formData, goal: value })}
                    className="grid grid-cols-2 gap-2"
                  >
                    {goals.map((goal) => (
                      <div key={goal.value}>
                        <RadioGroupItem
                          value={goal.value}
                          id={goal.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={goal.value}
                          className="flex items-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                        >
                          <span>{goal.icon}</span>
                          <span className="text-sm">{goal.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                    Atrás
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 gap-2"
                >
                  {step === 3 ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Calcular recomendación
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
