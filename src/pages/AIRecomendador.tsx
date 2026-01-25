import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { QuickReplies } from "@/components/ai/QuickReplies";
import { ChatInput } from "@/components/ai/ChatInput";
import { ProductRecommendation } from "@/components/ai/ProductRecommendation";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

type Step = "welcome" | "name" | "weight" | "age" | "activity" | "result";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
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

const calculateDailyGrams = (weight: number, age: string, activity: string): number => {
  const puppyPercentage = 0.06; // Simplified for puppies
  const seniorPercentage = 0.025;
  
  if (age === "puppy") {
    return Math.round(weight * puppyPercentage * 1000);
  }
  if (age === "senior") {
    return Math.round(weight * seniorPercentage * 1000);
  }
  
  // Adult - use activity level
  const activityPercentages: Record<string, number> = {
    low: 0.025,
    normal: 0.03,
    high: 0.04,
  };
  return Math.round(weight * (activityPercentages[activity] || 0.03) * 1000);
};

export default function AIRecomendador() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRecommendation } = useRecommendation();
  const { addItem } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<Step>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [petData, setPetData] = useState({
    name: "",
    weight: 0,
    age: "",
    activity: "normal",
  });
  const [result, setResult] = useState<{
    dailyGrams: number;
    packagesPerMonth: number;
    product: any;
    productName: string;
  } | null>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step]);

  const addMessage = (content: string, isBot: boolean) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), content, isBot }]);
  };

  const startChat = () => {
    addMessage("¡Hola! 👋 Soy el Dogtor. Vamos a encontrar la dieta perfecta. ¿Cómo se llama tu mejor amigo?", true);
    setStep("name");
  };

  const handleNameSubmit = (name: string) => {
    setPetData(prev => ({ ...prev, name }));
    addMessage(name, false);
    setTimeout(() => {
      addMessage(`¡Es un placer conocer a ${name}! Un gusto. Vamos a chequear sus medidas 📏. ¿Cuánto pesa?`, true);
      setStep("weight");
    }, 300);
  };

  const handleWeightSelect = (value: string, label: string) => {
    const weight = parseInt(value);
    setPetData(prev => ({ ...prev, weight }));
    addMessage(label, false);
    setTimeout(() => {
      addMessage(`Entendido. ¿Y en qué etapa de vida está ${petData.name}? 🎂`, true);
      setStep("age");
    }, 300);
  };

  const handleAgeSelect = (value: string, label: string) => {
    setPetData(prev => ({ ...prev, age: value }));
    addMessage(label, false);
    
    if (value === "adult") {
      setTimeout(() => {
        addMessage("¿Qué tan activo es?", true);
        setStep("activity");
      }, 300);
    } else {
      setTimeout(() => calculateResult(value, "normal"), 300);
    }
  };

  const handleActivitySelect = (value: string, label: string) => {
    setPetData(prev => ({ ...prev, activity: value }));
    addMessage(label, false);
    setTimeout(() => calculateResult(petData.age, value), 300);
  };

  const calculateResult = (age: string, activity: string) => {
    const dailyGrams = calculateDailyGrams(petData.weight, age, activity);
    const monthlyGrams = dailyGrams * 30;
    
    // Recommend based on consumption
    const recommendedPresentation = monthlyGrams > 10000 ? "1kg" : "500g";
    const gramsPerPack = recommendedPresentation === "1kg" ? 1000 : 500;
    const packagesPerMonth = Math.ceil(monthlyGrams / gramsPerPack);
    
    // Find matching product (prefer pollo for simplicity)
    const recommendedProduct = products?.find(
      p => p.protein_line === "pollo" && p.presentation === recommendedPresentation
    ) || products?.[0];

    const aiRecommendation = {
      petName: petData.name,
      breed: "Mestizo",
      weight: petData.weight,
      age,
      activity,
      goal: "premium",
      dailyGrams,
      monthlyGrams,
      packagesPerMonth,
      recommendedProtein: "pollo",
      recommendedPresentation,
      product: recommendedProduct,
      isPuppy: age === "puppy",
      message: `Para ${petData.name} recomendamos ${dailyGrams}g diarios.`,
      createdAt: new Date().toISOString(),
    };
    
    setRecommendation(aiRecommendation);
    setResult({
      dailyGrams,
      packagesPerMonth,
      product: recommendedProduct,
      productName: recommendedProduct?.name || "BARF Premium",
    });
    
    addMessage(`¡Perfecto! Aquí está el plan ideal para ${petData.name} 🎉`, true);
    setStep("result");
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
      description: `${result.product.name} para ${petData.name}`,
    });
    
    navigate("/carrito");
  };

  const handleRestart = () => {
    setMessages([]);
    setPetData({ name: "", weight: 0, age: "", activity: "normal" });
    setResult(null);
    setStep("welcome");
  };

  return (
    <Layout>
      <div className="container max-w-lg py-6 min-h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Asistente Raw Paw
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col gap-4 pb-4">
          <AnimatePresence mode="wait">
            {step === "welcome" ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-5xl">🐕</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Encuentra el plan perfecto
                  </h1>
                  <p className="text-muted-foreground">
                    En 30 segundos sabrás cuánto necesita tu perro
                  </p>
                </div>
                <Button size="lg" onClick={startChat} className="gap-2">
                  ¡Empezar!
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3"
              >
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} content={msg.content} isBot={msg.isBot} />
                ))}
                
                {/* Input/Options based on step */}
                {step === "name" && (
                  <div className="self-start ml-13 max-w-[85%]">
                    <ChatInput
                      placeholder="Nombre de tu perro..."
                      onSubmit={handleNameSubmit}
                    />
                  </div>
                )}
                
                {step === "weight" && (
                  <div className="self-start ml-13 max-w-[85%]">
                    <QuickReplies
                      options={weightOptions}
                      onSelect={handleWeightSelect}
                      columns={4}
                    />
                  </div>
                )}
                
                {step === "age" && (
                  <div className="self-start ml-13 max-w-[85%]">
                    <QuickReplies
                      options={ageOptions}
                      onSelect={handleAgeSelect}
                      columns={3}
                    />
                  </div>
                )}
                
                {step === "activity" && (
                  <div className="self-start ml-13 max-w-[85%]">
                    <QuickReplies
                      options={activityOptions}
                      onSelect={handleActivitySelect}
                      columns={3}
                    />
                  </div>
                )}
                
                {step === "result" && result && (
                  <div className="self-start ml-13 max-w-[85%]">
                    <ProductRecommendation
                      petName={petData.name}
                      dailyGrams={result.dailyGrams}
                      packagesPerMonth={result.packagesPerMonth}
                      productName={result.productName}
                      product={result.product}
                      onAddToCart={handleAddToCart}
                      onRestart={handleRestart}
                    />
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
