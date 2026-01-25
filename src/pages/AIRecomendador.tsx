import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ChatMessage, QuickReplies, ChatInput, ChatContainer, DualRecommendation } from "@/components/ai";
import { useRecommendation } from "@/hooks/useRecommendation";
import { calculateRecommendation } from "@/hooks/useRecommendationCalculator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Step = "name" | "weight" | "age" | "activity" | "goal" | "result";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
}

interface PetData {
  name: string;
  weight: number;
  age: string;
  activity: string;
  goal: string;
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
  { value: "high", label: "Muy activo", emoji: "⚡" },
];

const goalOptions = [
  { value: "standard", label: "Standard (Pollo)", emoji: "🌿" },
  { value: "mix", label: "Mix (Pollo + Res)", emoji: "🔄" },
  { value: "premium", label: "Premium (Res)", emoji: "✨" },
];

export default function AIRecomendador() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRecommendation } = useRecommendation();
  const { addItem } = useCart();
  
  const [step, setStep] = useState<Step>("name");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "¡Hola! 👋 Soy el Dogtor. Vamos a encontrar la dieta perfecta. ¿Cómo se llama tu mejor amigo?",
      isBot: true,
    }
  ]);
  const [petData, setPetData] = useState<PetData>({
    name: "",
    weight: 0,
    age: "",
    activity: "normal",
    goal: "standard",
  });
  const [result, setResult] = useState<ReturnType<typeof calculateRecommendation> | null>(null);

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

  const addMessage = (content: string, isBot: boolean) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), content, isBot }]);
  };

  const handleNameSubmit = (name: string) => {
    setPetData(prev => ({ ...prev, name }));
    addMessage(name, false);
    setTimeout(() => {
      addMessage(`¡Es un placer conocer a ${name}! Un gusto. Vamos a chequear sus medidas 📏. ¿Cuánto pesa?`, true);
      setStep("weight");
    }, 400);
  };

  const handleWeightSelect = (value: string, label: string) => {
    const weight = parseInt(value);
    setPetData(prev => ({ ...prev, weight }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`Entendido. ¿Y en qué etapa de vida está ${petData.name}? 🎂`, true);
      setStep("age");
    }, 400);
  };

  const handleAgeSelect = (value: string, label: string) => {
    setPetData(prev => ({ ...prev, age: value }));
    addMessage(label, false);
    
    // Always ask for activity level regardless of age
    setTimeout(() => {
      addMessage(`¿Qué tan activo es ${petData.name}? 🏃`, true);
      setStep("activity");
    }, 400);
  };

  const handleActivitySelect = (value: string, label: string) => {
    setPetData(prev => ({ ...prev, activity: value }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage("¿Qué tipo de plan prefieres para tu peludo? 💚", true);
      setStep("goal");
    }, 400);
  };

  const handleGoalSelect = (value: string, label: string) => {
    const updatedPetData = { ...petData, goal: value };
    setPetData(updatedPetData);
    addMessage(label, false);
    
    setTimeout(() => {
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
          packagesPerMonth: Math.ceil(recommendation.monthlyKg / 1), // Assuming 1kg packs
          recommendedProtein: value === "premium" ? "res" : "pollo",
          recommendedPresentation: "1kg",
          product: recommendation.optionA.products[0],
          isPuppy: updatedPetData.age === "puppy",
          message: `Para ${updatedPetData.name} recomendamos ${recommendation.dailyGrams}g diarios.`,
          createdAt: new Date().toISOString(),
        });
        
        addMessage(`¡Perfecto! Aquí está el plan ideal para ${updatedPetData.name} 🎉`, true);
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
    // Navigate to product page using slug
    navigate(`/producto/${productSlug}`);
  };

  const handleRestart = () => {
    // Clear saved state
    localStorage.removeItem("ai-recommender-state");
    
    setMessages([{
      id: "welcome",
      content: "¡Hola! 👋 Soy el Dogtor. Vamos a encontrar la dieta perfecta. ¿Cómo se llama tu mejor amigo?",
      isBot: true,
    }]);
    setPetData({ name: "", weight: 0, age: "", activity: "normal", goal: "standard" });
    setResult(null);
    setStep("name");
  };

  // Render input section based on current step
  const renderInputSection = () => {
    if (step === "result") {
      return null;
    }
    
    switch (step) {
      case "name":
        return <ChatInput placeholder="Nombre de tu perro..." onSubmit={handleNameSubmit} />;
      case "weight":
        return <QuickReplies options={weightOptions} onSelect={handleWeightSelect} columns={4} />;
      case "age":
        return <QuickReplies options={ageOptions} onSelect={handleAgeSelect} columns={3} />;
      case "activity":
        return <QuickReplies options={activityOptions} onSelect={handleActivitySelect} columns={3} />;
      case "goal":
        return <QuickReplies options={goalOptions} onSelect={handleGoalSelect} columns={3} />;
      default:
        return null;
    }
  };

  return (
    <Layout hideFooter>
      <ChatContainer inputSection={renderInputSection()}>
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
            onSelectOption={handleSelectOption}
            onViewProduct={handleViewProduct}
            onRestart={handleRestart}
          />
        )}
      </ChatContainer>
    </Layout>
  );
}
