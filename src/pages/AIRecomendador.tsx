import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Dog, Scale, Calendar, Target, Utensils, ArrowRight, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const breeds = [
  "Chihuahua", "Pug", "French Bulldog", "Beagle", "Cocker Spaniel",
  "Border Collie", "Labrador", "Golden Retriever", "Pastor Alemán",
  "Husky Siberiano", "Rottweiler", "Gran Danés", "Otro / Mestizo"
];

const goals = [
  { value: "weight-loss", label: "Perder peso", icon: "🏃" },
  { value: "maintenance", label: "Mantener peso", icon: "⚖️" },
  { value: "muscle", label: "Ganar músculo", icon: "💪" },
  { value: "health", label: "Mejorar salud general", icon: "❤️" },
  { value: "digestion", label: "Mejorar digestión", icon: "🌿" },
  { value: "coat", label: "Mejorar pelaje", icon: "✨" },
];

const diets = [
  { value: "kibble", label: "Croquetas comerciales" },
  { value: "wet", label: "Comida húmeda enlatada" },
  { value: "homemade", label: "Comida casera" },
  { value: "mixed", label: "Mezcla de varias" },
  { value: "barf", label: "Ya come BARF" },
];

// Mock product recommendations based on weight
const getRecommendedProduct = (weight: number) => {
  if (weight <= 10) {
    return {
      id: "c0105933-7bcd-4dce-842a-aa22492d56ed",
      name: "Starter Pack 7 Días",
      price: 599,
      slug: "starter-pack",
      gramsPerDay: Math.round(weight * 25),
      reason: "Perfecto para comenzar con la dieta BARF. Porción ideal para perros pequeños."
    };
  } else if (weight <= 20) {
    return {
      id: "d7aa93cf-2b41-4b59-9749-80a30975eb95",
      name: "Plan Quincenal",
      price: 1099,
      slug: "plan-quincenal",
      gramsPerDay: Math.round(weight * 30),
      reason: "Ideal para perros medianos. 15 días para ver resultados visibles."
    };
  } else {
    return {
      id: "9a68e6c9-2fe8-49d1-9602-a9dae65feeaa",
      name: "Plan Mensual",
      price: 1899,
      slug: "plan-mensual",
      gramsPerDay: Math.round(weight * 35),
      reason: "La mejor opción para perros grandes. Un mes completo de nutrición premium."
    };
  }
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
    currentDiet: "",
    goal: "",
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
        return formData.weight && formData.age;
      case 3:
        return formData.currentDiet && formData.goal;
      default:
        return false;
    }
  };

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const weight = parseFloat(formData.weight);
    const recommendation = getRecommendedProduct(weight);
    
    const goalLabel = goals.find(g => g.value === formData.goal)?.label || formData.goal;
    
    const aiRecommendation = {
      breed: formData.breed,
      weight: weight,
      age: formData.age,
      currentDiet: formData.currentDiet,
      goal: goalLabel,
      recommendedPlan: recommendation.name,
      gramsPerDay: recommendation.gramsPerDay,
      message: `Basado en que ${formData.petName} es un ${formData.breed} de ${weight}kg con el objetivo de "${goalLabel}", te recomendamos el ${recommendation.name}. ${recommendation.reason} Deberás darle aproximadamente ${recommendation.gramsPerDay}g diarios divididos en 2 porciones.`,
      createdAt: new Date().toISOString(),
    };
    
    setRecommendation(aiRecommendation);
    setResult({ ...recommendation, ...aiRecommendation, petName: formData.petName });
    setIsAnalyzing(false);
  };

  const handleAddToCart = () => {
    if (!result) return;
    
    addItem({
      id: result.id,
      name: result.name,
      price: result.price,
      imageUrl: undefined,
    });
    
    toast({
      title: "¡Agregado al carrito!",
      description: `${result.name} para ${result.petName}`,
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
              Nuestra IA está calculando el plan perfecto basado en raza, peso, edad y objetivos.
            </p>
            <div className="mt-8 space-y-2 text-sm text-muted-foreground">
              <p className="animate-pulse">🔍 Analizando necesidades nutricionales...</p>
              <p className="animate-pulse delay-300">📊 Calculando porciones ideales...</p>
              <p className="animate-pulse delay-500">🎯 Seleccionando el mejor plan...</p>
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
              <h1 className="text-3xl font-bold mb-2">¡Listo! Tenemos tu plan ideal</h1>
              <p className="text-muted-foreground">
                Basado en el perfil de {result.petName}
              </p>
            </div>

            <Card className="mb-6 border-primary border-2">
              <CardHeader className="bg-primary/5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-primary">{result.name}</CardTitle>
                    <CardDescription>Plan recomendado para {result.petName}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      ${result.price.toLocaleString("es-MX")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{result.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{result.gramsPerDay}g</p>
                    <p className="text-sm text-muted-foreground">por día</p>
                  </div>
                  <div className="bg-card border rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">2</p>
                    <p className="text-sm text-muted-foreground">porciones diarias</p>
                  </div>
                </div>

                <Button onClick={handleAddToCart} size="lg" className="w-full gap-2">
                  Agregar al carrito
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

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
                    <span>{result.age}</span>
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
              Cuéntanos sobre tu perro y te recomendaremos el plan perfecto
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
                {step === 3 && "Alimentación y objetivos"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Información básica de tu mascota"}
                {step === 2 && "Esto nos ayuda a calcular las porciones"}
                {step === 3 && "Para personalizar la recomendación"}
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
                      onValueChange={(value) => setFormData({ ...formData, age: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la edad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cachorro">Cachorro (0-12 meses)</SelectItem>
                        <SelectItem value="joven">Joven (1-3 años)</SelectItem>
                        <SelectItem value="adulto">Adulto (3-7 años)</SelectItem>
                        <SelectItem value="senior">Senior (7+ años)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Alimentación actual</Label>
                    <Select
                      value={formData.currentDiet}
                      onValueChange={(value) => setFormData({ ...formData, currentDiet: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="¿Qué come actualmente?" />
                      </SelectTrigger>
                      <SelectContent>
                        {diets.map((diet) => (
                          <SelectItem key={diet.value} value={diet.value}>
                            {diet.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Objetivo principal</Label>
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
                </>
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
                      Obtener recomendación
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
