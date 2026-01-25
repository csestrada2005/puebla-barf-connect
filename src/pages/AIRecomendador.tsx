import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ChatMessage, QuickReplies, ChatInput, ChatContainer, DualRecommendation } from "@/components/ai";
import { useRecommendation } from "@/hooks/useRecommendation";
import { calculateRecommendation, PetData, RecommendationResult } from "@/hooks/useRecommendationCalculator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Step = "name" | "weight" | "age" | "activity" | "bodyCondition" | "sensitivity" | "goal" | "result";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
}

interface CoverageZone {
  id: string;
  zone_name: string;
  delivery_fee: number | null;
}

interface ExtendedPetData extends PetData {
  zoneId: string;
  zoneName: string;
  deliveryFee: number;
}

const weightOptions = [
  { value: "3", label: "0-5 kg", emoji: "🐕" },
  { value: "10", label: "5-15 kg", emoji: "🦮" },
  { value: "22", label: "15-30 kg", emoji: "🐕‍🦺" },
  { value: "40", label: "30+ kg", emoji: "🐺" },
];

const ageOptions = [
  { value: "puppy", label: "Cachorro", emoji: "🐶" },
  { value: "adult", label: "Adulto", emoji: "🐕" },
  { value: "senior", label: "Senior", emoji: "🦴" },
];

const activityOptions = [
  { value: "low", label: "Tranquilo", emoji: "😴" },
  { value: "normal", label: "Normal", emoji: "🚶" },
  { value: "high", label: "Activo", emoji: "⚡" },
];

const bodyConditionOptions = [
  { value: "underweight", label: "Flaco", emoji: "🦴" },
  { value: "ideal", label: "Ideal", emoji: "✨" },
  { value: "overweight", label: "Gordito", emoji: "🐷" },
];

const sensitivityOptions = [
  { value: "high", label: "Sí", emoji: "🚨" },
  { value: "medium", label: "A veces", emoji: "🤔" },
  { value: "low", label: "No", emoji: "💪" },
];

const goalOptions = [
  { value: "trial", label: "Probar", emoji: "🐾" },
  { value: "routine", label: "Rutina", emoji: "📅" },
  { value: "variety", label: "Variedad", emoji: "🎨" },
];

export default function AIRecomendador() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRecommendation } = useRecommendation();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState<Step>("name");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "¡Hola! 👋 Soy el Dogtor 🩺. Vamos a encontrar la dieta perfecta para tu perrito. ¿Cómo se llama tu mejor amigo?",
      isBot: true,
    }
  ]);
  const [petData, setPetData] = useState<ExtendedPetData>({
    name: "",
    weight: 0,
    age: "",
    activity: "normal",
    bodyCondition: "ideal",
    sensitivity: "low",
    goal: "routine",
    zoneId: "",
    zoneName: "",
    deliveryFee: 0,
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("ai-recommender-state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setStep(parsed.step);
        setMessages(parsed.messages);
        setPetData(parsed.petData);
        setResult(parsed.result);
      } catch (e) {
        console.error("Failed to restore AI state:", e);
      }
    }
  }, []);

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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (step !== "name" || messages.length > 1) {
      const stateToSave = { step, messages, petData, result };
      localStorage.setItem("ai-recommender-state", JSON.stringify(stateToSave));
    }
  }, [step, messages, petData, result]);

  // Save dog profile to database when result is ready
  const saveDogProfile = async (data: ExtendedPetData, recommendation: RecommendationResult) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Map internal values to database values
      const ageStageMap: Record<string, string> = {
        puppy: "puppy",
        adult: "adult", 
        senior: "senior"
      };
      
      const proteinMap: Record<string, string> = {
        chicken: "chicken",
        beef: "beef",
        mix: "mix"
      };

      await supabase.from("dog_profiles").upsert({
        user_id: user.id,
        name: data.name,
        age_stage: ageStageMap[data.age] || "adult",
        weight_kg: data.weight,
        activity_level: data.activity,
        body_condition: data.bodyCondition,
        sensitivity: data.sensitivity,
        goal: data.goal,
        daily_grams: recommendation.dailyGrams,
        weekly_kg: recommendation.weeklyKg,
        recommended_plan_type: recommendation.planType,
        recommended_protein: proteinMap[recommendation.recommendedProtein] || "chicken",
      }, {
        onConflict: "user_id"
      });
    } catch (error) {
      console.error("Failed to save dog profile:", error);
    }
  };

  const addMessage = (content: string, isBot: boolean) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), content, isBot }]);
  };

  const handleNameSubmit = (name: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, name }));
    addMessage(name, false);
    setTimeout(() => {
      addMessage(`¡Encantado de conocer a ${name}! 🐾 Ahora vamos a revisar sus medidas. ¿Cuánto pesa aproximadamente?`, true);
      setStep("weight");
      setIsProcessing(false);
    }, 400);
  };

  const handleWeightSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const weight = parseInt(value);
    setPetData(prev => ({ ...prev, weight }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`Perfecto, anotado. ¿En qué etapa de vida está ${petData.name}? 🎂`, true);
      setStep("age");
      setIsProcessing(false);
    }, 400);
  };

  const handleAgeSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, age: value }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`Muy bien. ¿Qué tan activo es ${petData.name}? 🏃`, true);
      setStep("activity");
      setIsProcessing(false);
    }, 400);
  };

  const handleActivitySelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, activity: value }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`Ahora una pregunta importante para su nutrición. ¿Cómo describirías la condición corporal de ${petData.name}? ⚖️`, true);
      setStep("bodyCondition");
      setIsProcessing(false);
    }, 400);
  };

  const handleBodyConditionSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, bodyCondition: value }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`Entendido. ¿${petData.name} tiene alguna sensibilidad digestiva o alergias alimentarias? 🤧`, true);
      setStep("sensitivity");
      setIsProcessing(false);
    }, 400);
  };

  const handleSensitivitySelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, sensitivity: value }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`¡Excelente! Última pregunta: ¿Cuál es tu objetivo con la dieta BARF para ${petData.name}? 🎯`, true);
      setStep("goal");
      setIsProcessing(false);
    }, 400);
  };

  const handleGoalSelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const updatedPetData: ExtendedPetData = { 
      ...petData, 
      goal: value,
      zoneId: "",
      zoneName: "",
      deliveryFee: 0,
    };
    setPetData(updatedPetData);
    addMessage(label, false);
    
    setTimeout(async () => {
      if (products && products.length > 0) {
        const recommendation = calculateRecommendation(updatedPetData, products);
        setResult(recommendation);
        
        // Save to recommendation store
        setRecommendation({
          petName: updatedPetData.name,
          breed: "Mestizo",
          weight: updatedPetData.weight,
          age: updatedPetData.age,
          activity: updatedPetData.activity,
          goal: updatedPetData.goal,
          dailyGrams: recommendation.dailyGrams,
          monthlyGrams: recommendation.monthlyKg * 1000,
          packagesPerMonth: Math.ceil(recommendation.monthlyKg / 1),
          recommendedProtein: recommendation.recommendedProtein === "chicken" ? "pollo" : recommendation.recommendedProtein === "beef" ? "res" : "mix",
          recommendedPresentation: "1kg",
          product: recommendation.optionA.products[0],
          isPuppy: updatedPetData.age === "puppy",
          message: `Para ${updatedPetData.name} recomendamos ${recommendation.dailyGrams}g diarios.`,
          createdAt: new Date().toISOString(),
        });
        
        // Save to database if logged in
        await saveDogProfile(updatedPetData, recommendation);
        
        addMessage(`🩺 ¡Diagnóstico completo! Aquí está el plan personalizado para ${updatedPetData.name} 🎉`, true);
        setStep("result");
      }
    }, 400);
  };

  const handleSelectOption = (option: "A" | "B", products: Array<{id: string; name: string; price: number; quantity: number}>) => {
    products.forEach(product => {
      for (let i = 0; i < product.quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
        });
      }
    });
    
    toast({
      title: "¡Agregado al carrito!",
      description: `Opción ${option} para ${petData.name}`,
    });
    
    navigate("/carrito");
  };

  const handleViewProduct = (productSlug: string) => {
    navigate(`/producto/${productSlug}`);
  };

  const handleRestart = () => {
    localStorage.removeItem("ai-recommender-state");
    
    setMessages([{
      id: "welcome",
      content: "¡Hola! 👋 Soy el Dogtor 🩺. Vamos a encontrar la dieta perfecta para tu peludo. ¿Cómo se llama tu mejor amigo?",
      isBot: true,
    }]);
    setPetData({ 
      name: "", 
      weight: 0, 
      age: "", 
      activity: "normal", 
      bodyCondition: "ideal",
      sensitivity: "low",
      goal: "routine",
      zoneId: "", 
      zoneName: "", 
      deliveryFee: 0 
    });
    setResult(null);
    setStep("name");
  };

  // Render input section based on current step
  const renderInputSection = () => {
    if (step === "result") return null;
    
    switch (step) {
      case "name":
        return <ChatInput placeholder="Nombre de tu perro..." onSubmit={handleNameSubmit} disabled={isProcessing} />;
      case "weight":
        return <QuickReplies options={weightOptions} onSelect={handleWeightSelect} columns={4} disabled={isProcessing} />;
      case "age":
        return <QuickReplies options={ageOptions} onSelect={handleAgeSelect} columns={3} disabled={isProcessing} />;
      case "activity":
        return <QuickReplies options={activityOptions} onSelect={handleActivitySelect} columns={3} disabled={isProcessing} />;
      case "bodyCondition":
        return <QuickReplies options={bodyConditionOptions} onSelect={handleBodyConditionSelect} columns={3} disabled={isProcessing} />;
      case "sensitivity":
        return <QuickReplies options={sensitivityOptions} onSelect={handleSensitivitySelect} columns={3} disabled={isProcessing} />;
      case "goal":
        return <QuickReplies options={goalOptions} onSelect={handleGoalSelect} columns={3} disabled={isProcessing} />;
      default:
        return null;
    }
  };

  return (
    <Layout hideFooter>
      <ChatContainer inputSection={renderInputSection()} scrollToEnd={step !== "result"}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} content={msg.content} isBot={msg.isBot} />
        ))}
        
        {step === "result" && result && (
          <DualRecommendation
            petName={petData.name}
            dailyGrams={result.dailyGrams}
            weeklyKg={result.weeklyKg}
            durationDays={result.optionA.durationDays}
            planType={result.planType}
            optionA={result.optionA}
            optionB={result.optionB}
            deliveryFee={petData.deliveryFee}
            zoneName={petData.zoneName}
            reasoning={result.reasoning}
            onSelectOption={handleSelectOption}
            onViewProduct={handleViewProduct}
            onRestart={handleRestart}
          />
        )}
      </ChatContainer>
    </Layout>
  );
}
