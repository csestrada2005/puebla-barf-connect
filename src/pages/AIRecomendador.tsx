import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ChatMessage, QuickReplies, ChatInput, ChatContainer, DualRecommendation, SubscriptionTiers } from "@/components/ai";
import { useRecommendation } from "@/hooks/useRecommendation";
import { calculateRecommendation, PetData, RecommendationResult } from "@/hooks/useRecommendationCalculator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Package, ShoppingCart } from "lucide-react";

type Step =
  | "initial"
  | "name"
  | "weight"
  | "age"
  | "activity"
  | "bodyCondition"
  | "sensitivity"
  | "goal"
  | "result"
  | "profile_entry"
  | "profile_name"
  | "profile_birthday"
  | "profile_weight"
  | "profile_activity"
  | "profile_bodyCondition"
  | "profile_allergies"
  | "profile_done";

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

type DogProfileRow = {
  id: string;
  name: string;
  birthday: string | null;
  weight_kg: number;
  activity_level: string;
  body_condition: string;
  sensitivity: string;
  age_stage: string;
  status: string;
  daily_grams: number;
  weekly_kg: number;
  recommended_protein: string;
  recommended_plan_type: string;
  goal: string;
};

type Allergy = "chicken" | "beef" | "none";

interface ProfileDraft {
  name: string;
  birthday: string | null; // YYYY-MM-DD
  weightKg: number;
  activity: "low" | "normal" | "high";
  bodyCondition: "underweight" | "ideal" | "overweight";
  allergy: Allergy;
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

const allergyOptions = [
  { value: "chicken", label: "Pollo", emoji: "🍗" },
  { value: "beef", label: "Res", emoji: "🥩" },
  { value: "none", label: "Ninguna", emoji: "✅" },
];

const initialOptions = [
  { value: "new_plan", label: "Obtener Plan Nutricional", emoji: "🥗" },
  { value: "profile", label: "Crear/Editar Perfil", emoji: "🐕" },
];

export default function AIRecomendador() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { setRecommendation } = useRecommendation();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const consumedIntentRef = useRef(false);
  
  const [step, setStep] = useState<Step>("initial");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "¡Hola! 👋 Soy el Dogtor. ¿En qué te puedo ayudar hoy? 🐾",
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

  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    name: "",
    birthday: null,
    weightKg: 0,
    activity: "normal",
    bodyCondition: "ideal",
    allergy: "none",
  });
  const [editingDogId, setEditingDogId] = useState<string | null>(null);
  const [pendingProfileEntry, setPendingProfileEntry] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    const intent = searchParams.get("intent");
    if (intent === "new_profile") return;

    const savedState = localStorage.getItem("ai-recommender-state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const validSteps: Step[] = [
          "initial",
          "name",
          "weight",
          "age",
          "activity",
          "bodyCondition",
          "sensitivity",
          "goal",
          "result",
          "profile_entry",
          "profile_name",
          "profile_birthday",
          "profile_weight",
          "profile_activity",
          "profile_bodyCondition",
          "profile_allergies",
          "profile_done",
        ];
        const restoredStep = validSteps.includes(parsed.step) ? parsed.step : "initial";
        setStep(restoredStep);
        setMessages(parsed.messages);
        setPetData(parsed.petData);
        setResult(parsed.result);
        if (parsed.profileDraft) setProfileDraft(parsed.profileDraft);
        if (parsed.editingDogId) setEditingDogId(parsed.editingDogId);
      } catch (e) {
        console.error("Failed to restore AI state:", e);
      }
    }
  }, [searchParams]);

  const { data: dogProfiles = [], isLoading: isDogsLoading } = useQuery({
    queryKey: ["my-dogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as DogProfileRow[];

      const { data, error } = await supabase
        .from("dog_profiles")
        .select(
          "id,name,birthday,weight_kg,activity_level,body_condition,sensitivity,age_stage,status,daily_grams,weekly_kg,recommended_protein,recommended_plan_type,goal"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as DogProfileRow[];
    },
    enabled: !!user?.id,
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (step !== "name" || messages.length > 1) {
      const stateToSave = { step, messages, petData, result, profileDraft, editingDogId };
      localStorage.setItem("ai-recommender-state", JSON.stringify(stateToSave));
    }
  }, [step, messages, petData, result, profileDraft, editingDogId]);

  const startProfileEntry = () => {
    const names = dogProfiles.map((d) => d.name).filter(Boolean);
    const list = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} y ${names[1]}` : names.slice(0, -1).join(", ") + ` y ${names[names.length - 1]}`;
    setMessages([
      {
        id: "profile-entry",
        content: `Veo que ya tienes a ${list}. 🐶 ¿Qué quieres hacer?`,
        isBot: true,
      },
    ]);
    setStep("profile_entry");
  };

  const startNewDogFlow = (dogToEdit?: DogProfileRow) => {
    const draft: ProfileDraft = dogToEdit
      ? {
          name: dogToEdit.name || "",
          birthday: dogToEdit.birthday,
          weightKg: Number(dogToEdit.weight_kg || 0),
          activity: (dogToEdit.activity_level as any) || "normal",
          bodyCondition: (dogToEdit.body_condition as any) || "ideal",
          allergy: "none",
        }
      : {
          name: "",
          birthday: null,
          weightKg: 0,
          activity: "normal",
          bodyCondition: "ideal",
          allergy: "none",
        };

    setEditingDogId(dogToEdit?.id ?? null);
    setProfileDraft(draft);
    setResult(null);
    setIsResultOpen(false);
    setMessages([
      {
        id: "profile-start",
        content: dogToEdit
          ? `Vamos a actualizar el perfil de ${dogToEdit.name}. ✏️\n\n¿Cómo se llama el paciente? 🐾 (escribe “igual” para mantener)`
          : "¿Cómo se llama el paciente? 🐾",
        isBot: true,
      },
    ]);
    setStep("profile_name");
  };

  // Smart entry from /ai?intent=new_profile
  useEffect(() => {
    const intent = searchParams.get("intent");
    if (intent !== "new_profile") return;
    if (consumedIntentRef.current) return;

    // consume intent exactly once
    if (!isAuthenticated || !user) {
      consumedIntentRef.current = true;
      setSearchParams({});
      return;
    }

    if (isDogsLoading) return;
    consumedIntentRef.current = true;
    localStorage.removeItem("ai-recommender-state");
    setSearchParams({});

    if (dogProfiles.length === 0) startNewDogFlow();
    else startProfileEntry();
  }, [searchParams, setSearchParams, isAuthenticated, user, isDogsLoading, dogProfiles]);

  // Smart entry when user clicks "Crear/Editar" inside the chat
  useEffect(() => {
    if (!pendingProfileEntry) return;
    if (isDogsLoading) return;

    setPendingProfileEntry(false);
    if (dogProfiles.length === 0) startNewDogFlow();
    else startProfileEntry();
  }, [pendingProfileEntry, isDogsLoading, dogProfiles]);

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

  const handleInitialSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);
    
    if (value === "new_plan") {
      setTimeout(() => {
        addMessage("¡Excelente! Vamos a encontrar la dieta perfecta. ¿Cómo se llama tu mejor amigo?", true);
        setStep("name");
        setIsProcessing(false);
      }, 400);
    } else if (value === "profile") {
      setTimeout(() => {
        if (!isAuthenticated || !user) {
          addMessage("Para guardar y editar perfiles necesito que inicies sesión. 🔐", true);
          setIsProcessing(false);
          setTimeout(() => navigate("/login"), 800);
          return;
        }

        if (isDogsLoading) {
          addMessage("Un segundito… estoy revisando tus perfiles. ⏳", true);
          setPendingProfileEntry(true);
          setIsProcessing(false);
          return;
        }

        setIsProcessing(false);
        if (dogProfiles.length === 0) startNewDogFlow();
        else startProfileEntry();
      }, 400);
    }
  };

  const handleProfileEntrySelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    setTimeout(() => {
      if (value === "new") {
        setIsProcessing(false);
        startNewDogFlow();
        return;
      }

      if (value.startsWith("edit:")) {
        const id = value.replace("edit:", "");
        const dog = dogProfiles.find((d) => d.id === id);
        setIsProcessing(false);
        if (dog) startNewDogFlow(dog);
        return;
      }

      setIsProcessing(false);
    }, 250);
  };

  const handleProfileNameSubmit = (name: string) => {
    if (isProcessing) return;
    const raw = name.trim();
    const isKeep = !!editingDogId && /^igual$/i.test(raw);
    const nextName = isKeep ? profileDraft.name : raw;
    if (!nextName) return;

    setIsProcessing(true);
    setProfileDraft((prev) => ({ ...prev, name: nextName }));
    addMessage(isKeep ? `igual (${profileDraft.name})` : nextName, false);

    setTimeout(() => {
      addMessage("Para calcular su etapa, ¿cuándo es su cumpleaños? 🎂 (YYYY-MM-DD o DD/MM/AAAA)", true);
      setStep("profile_birthday");
      setIsProcessing(false);
    }, 350);
  };

  const handleProfileBirthdaySubmit = (input: string) => {
    if (isProcessing) return;
    const raw = input.trim();
    const isKeep = !!editingDogId && /^igual$/i.test(raw);

    const parsed = isKeep ? profileDraft.birthday : parseBirthdayInput(raw);
    if (!parsed && !isKeep) {
      addMessage(raw, false);
      addMessage("No pude leer esa fecha 😅. Prueba con YYYY-MM-DD (ej: 2020-05-14) o DD/MM/AAAA.", true);
      return;
    }

    setIsProcessing(true);
    addMessage(isKeep ? `igual (${profileDraft.birthday || "sin fecha"})` : parsed!, false);
    setProfileDraft((prev) => ({ ...prev, birthday: parsed }));

    setTimeout(() => {
      addMessage("¿Cuánto pesa actualmente? (kg) ⚖️", true);
      setStep("profile_weight");
      setIsProcessing(false);
    }, 350);
  };

  const handleProfileWeightSubmit = (input: string) => {
    if (isProcessing) return;
    const raw = input.trim();
    const isKeep = !!editingDogId && /^igual$/i.test(raw);
    const weight = isKeep ? profileDraft.weightKg : parseWeightKg(raw);
    if (!weight || weight <= 0) {
      addMessage(raw, false);
      addMessage("Dime el peso en kg (ej: 12.5).", true);
      return;
    }

    setIsProcessing(true);
    setProfileDraft((prev) => ({ ...prev, weightKg: weight }));
    addMessage(isKeep ? `igual (${profileDraft.weightKg} kg)` : `${weight} kg`, false);

    setTimeout(() => {
      addMessage("¿Es muy activo o prefiere el sofá?", true);
      setStep("profile_activity");
      setIsProcessing(false);
    }, 350);
  };

  const handleProfileActivitySelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (value !== "keep") {
      setProfileDraft((prev) => ({ ...prev, activity: value as any }));
      addMessage(label, false);
    } else {
      addMessage(`igual (${profileDraft.activity})`, false);
    }
    setTimeout(() => {
      addMessage("¿Cómo ves su cintura?", true);
      setStep("profile_bodyCondition");
      setIsProcessing(false);
    }, 350);
  };

  const handleProfileBodyConditionSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (value !== "keep") {
      setProfileDraft((prev) => ({ ...prev, bodyCondition: value as any }));
      addMessage(label, false);
    } else {
      addMessage(`igual (${profileDraft.bodyCondition})`, false);
    }
    setTimeout(() => {
      addMessage("¿Tiene alergias conocidas?", true);
      setStep("profile_allergies");
      setIsProcessing(false);
    }, 350);
  };

  const upsertDogProfileFromDraft = async (draft: ProfileDraft) => {
    if (!isAuthenticated || !user) throw new Error("User not authenticated");

    const ageStage = draft.birthday ? getAgeStageFromBirthday(draft.birthday) : "adult";
    const dailyGrams = computeDailyGrams({
      weightKg: draft.weightKg,
      ageStage,
      activity: draft.activity,
      bodyCondition: draft.bodyCondition,
    });

    const weeklyKg = Number(((dailyGrams * 7) / 1000).toFixed(2));

    const recommendedProtein =
      draft.allergy === "chicken" ? "beef" : draft.allergy === "beef" ? "chicken" : "mix";

    const payload: any = {
      user_id: user.id,
      name: draft.name,
      birthday: draft.birthday,
      age_stage: ageStage,
      weight_kg: draft.weightKg,
      activity_level: draft.activity,
      body_condition: draft.bodyCondition,
      sensitivity: draft.allergy === "none" ? "low" : "high",
      goal: "routine",
      daily_grams: dailyGrams,
      weekly_kg: weeklyKg,
      recommended_plan_type: "standard",
      recommended_protein: recommendedProtein,
      status: "active",
    };

    if (editingDogId) payload.id = editingDogId;

    const { data, error } = await supabase
      .from("dog_profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data as DogProfileRow;
  };

  const handleProfileAllergySelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    const nextDraft = { ...profileDraft, allergy: value as Allergy };
    setProfileDraft(nextDraft);

    try {
      const saved = await upsertDogProfileFromDraft(nextDraft);
      addMessage(`¡Listo! Perfil de ${saved.name} guardado con éxito. ✅`, true);
      setEditingDogId(null);
      setStep("profile_done");
    } catch (error: any) {
      toast({
        title: "No pude guardar el perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProfileDoneSelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    if (value === "view_plan") {
      // Reuse existing plan recommendation with defaults
      const ageStage = profileDraft.birthday ? getAgeStageFromBirthday(profileDraft.birthday) : "adult";
      const updatedPetData: ExtendedPetData = {
        ...petData,
        name: profileDraft.name,
        weight: profileDraft.weightKg,
        age: ageStage,
        activity: profileDraft.activity,
        bodyCondition: profileDraft.bodyCondition,
        sensitivity: profileDraft.allergy === "none" ? "low" : "high",
        goal: "routine",
        zoneId: "",
        zoneName: "",
        deliveryFee: 0,
      };
      setPetData(updatedPetData);

      if (products && products.length > 0) {
        const recommendation = calculateRecommendation(updatedPetData, products);
        setResult(recommendation);
        addMessage(`🧬 ¡Análisis completo! Aquí está el plan personalizado para ${updatedPetData.name} 🎉`, true);
        setStep("result");
        setIsResultOpen(true);
      } else {
        toast({
          title: "No pude generar el plan",
          description: "No hay productos disponibles para calcular tu plan.",
          variant: "destructive",
        });
      }

      setIsProcessing(false);
      return;
    }

    if (value === "back_dashboard") {
      setIsProcessing(false);
      navigate("/mi-cuenta");
      return;
    }

    setIsProcessing(false);
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
        
        addMessage(`🧬 ¡Análisis completo! Aquí está el plan personalizado para ${updatedPetData.name} 🎉`, true);
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

  const handleSelectSubscription = async (planType: "monthly" | "semestral" | "annual") => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Inicia sesión para suscribirte",
        description: "Necesitas una cuenta para crear tu suscripción.",
      });
      navigate("/registro");
      return;
    }

    try {
      // Calculate billing and delivery dates
      const billingWeeks = planType === "monthly" ? 4 : planType === "semestral" ? 24 : 52;
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + (billingWeeks * 7));
      
      const nextDeliveryDate = new Date();
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 3); // 3 days from now

      const { error } = await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan_type: planType,
        status: "active",
        protein_line: result?.recommendedProtein === "chicken" ? "pollo" : result?.recommendedProtein === "beef" ? "res" : "mix",
        presentation: result?.weeklyKg && result.weeklyKg >= 3 ? "1kg" : "500g",
        weekly_amount_kg: result?.weeklyKg || 0,
        frequency: "weekly",
        next_delivery_date: nextDeliveryDate.toISOString().split("T")[0],
        next_billing_date: nextBillingDate.toISOString().split("T")[0],
        price_per_kg: 150,
        discount_percent: planType === "monthly" ? 0 : planType === "semestral" ? 5 : 10,
      }, {
        onConflict: "user_id"
      });

      if (error) throw error;

      toast({
        title: "¡Suscripción creada! 🎉",
        description: `Tu plan ${planType} está activo. Primera entrega en 3 días.`,
      });

      setIsResultOpen(false);
      navigate("/mi-cuenta");
    } catch (error: any) {
      toast({
        title: "Error al crear suscripción",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = (productSlug: string) => {
    navigate(`/producto/${productSlug}`);
  };

  const handleRestart = () => {
    localStorage.removeItem("ai-recommender-state");
    
    setMessages([{
      id: "welcome",
      content: "¡Hola! 👋 Soy el Dogtor. ¿En qué te puedo ayudar hoy? 🐾",
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
    setStep("initial");
  };

  // Render input section based on current step
  const renderInputSection = () => {
    if (step === "result") return null;
    
    switch (step) {
      case "initial":
        return <QuickReplies options={initialOptions} onSelect={handleInitialSelect} columns={2} disabled={isProcessing} />;
      case "profile_entry": {
        const options = [
          ...dogProfiles.map((d) => ({ value: `edit:${d.id}`, label: `Editar ${d.name}`, emoji: "✏️" })),
          { value: "new", label: "Agregar Nuevo", emoji: "➕" },
        ];
        return <QuickReplies options={options} onSelect={handleProfileEntrySelect} columns={2} disabled={isProcessing} />;
      }
      case "profile_name":
        return <ChatInput placeholder="Nombre del perrito…" onSubmit={handleProfileNameSubmit} disabled={isProcessing} />;
      case "profile_birthday":
        return <ChatInput placeholder="YYYY-MM-DD (o DD/MM/AAAA)" onSubmit={handleProfileBirthdaySubmit} disabled={isProcessing} />;
      case "profile_weight":
        return <ChatInput placeholder="Peso en kg…" onSubmit={handleProfileWeightSubmit} disabled={isProcessing} />;
      case "profile_activity":
        return (
          <QuickReplies
            options={editingDogId ? [{ value: "keep", label: "Igual", emoji: "✅" }, ...activityOptions] : activityOptions}
            onSelect={handleProfileActivitySelect}
            columns={4}
            disabled={isProcessing}
          />
        );
      case "profile_bodyCondition":
        return (
          <QuickReplies
            options={editingDogId ? [{ value: "keep", label: "Igual", emoji: "✅" }, ...bodyConditionOptions] : bodyConditionOptions}
            onSelect={handleProfileBodyConditionSelect}
            columns={4}
            disabled={isProcessing}
          />
        );
      case "profile_allergies":
        return <QuickReplies options={allergyOptions} onSelect={handleProfileAllergySelect} columns={3} disabled={isProcessing} />;
      case "profile_done":
        return (
          <QuickReplies
            options={[
              { value: "view_plan", label: "Ver Plan Nutricional", emoji: "📄" },
              { value: "back_dashboard", label: "Volver", emoji: "🏠" },
            ]}
            onSelect={handleProfileDoneSelect}
            columns={2}
            disabled={isProcessing}
          />
        );
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

  const [resultTab, setResultTab] = useState<"subscription" | "oneoff">("subscription");

  return (
    <Layout hideFooter>
      <ChatContainer inputSection={renderInputSection()} scrollToEnd={step !== "result"}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} content={msg.content} isBot={msg.isBot} />
        ))}
        
        {step === "result" && result && (
          <div className="w-full px-4 py-6 space-y-4">
            <Button 
              onClick={() => setIsResultOpen(true)} 
              className="w-full gap-2 h-14 text-base font-bold shadow-lg"
              size="lg"
            >
              <FileText className="h-5 w-5" />
              📄 Ver Plan Personalizado
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRestart} 
              className="w-full gap-2 text-muted-foreground"
            >
              Nueva consulta
            </Button>
          </div>
        )}
      </ChatContainer>

      {/* Results Drawer with Tabs */}
      <Drawer open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DrawerContent className="h-[90vh] max-h-[90vh]">
          <div className="overflow-y-auto px-4 pb-4">
            {result && (
              <Tabs value={resultTab} onValueChange={(v) => setResultTab(v as "subscription" | "oneoff")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="subscription" className="gap-2">
                    <Package className="h-4 w-4" />
                    Suscripción
                  </TabsTrigger>
                  <TabsTrigger value="oneoff" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Compra Única
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="subscription">
                  <SubscriptionTiers
                    petName={petData.name}
                    dailyGrams={result.dailyGrams}
                    weeklyKg={result.weeklyKg}
                    pricePerKg={150}
                    onSelectPlan={(planType) => {
                      handleSelectSubscription(planType);
                    }}
                    onRestart={() => {
                      setIsResultOpen(false);
                      handleRestart();
                    }}
                  />
                </TabsContent>

                <TabsContent value="oneoff">
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
                    onSelectOption={(option, products) => {
                      handleSelectOption(option, products);
                      setIsResultOpen(false);
                    }}
                    onViewProduct={handleViewProduct}
                    onRestart={() => {
                      setIsResultOpen(false);
                      handleRestart();
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </Layout>
  );
}

function parseBirthdayInput(input: string): string | null {
  // Accept YYYY-MM-DD or DD/MM/YYYY
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(input)) return input;

  const dmy = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const padded = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // basic validity check
    const date = new Date(padded + "T00:00:00");
    if (Number.isNaN(date.getTime())) return null;
    return padded;
  }

  return null;
}

function parseWeightKg(input: string): number | null {
  const normalized = input.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 10) / 10;
}

function getAgeStageFromBirthday(birthdayIso: string): "puppy" | "adult" | "senior" {
  const birth = new Date(birthdayIso + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return "adult";

  const today = new Date();
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

  if (months < 12) return "puppy";
  if (months >= 84) return "senior";
  return "adult";
}

function computeDailyGrams(params: {
  weightKg: number;
  ageStage: "puppy" | "adult" | "senior";
  activity: "low" | "normal" | "high";
  bodyCondition: "underweight" | "ideal" | "overweight";
}): number {
  const base = params.ageStage === "puppy" ? 6 : params.ageStage === "senior" ? 2.0 : 2.5;
  const activityAdj = params.activity === "high" ? 0.5 : params.activity === "low" ? -0.5 : 0;
  const conditionAdj =
    params.bodyCondition === "underweight" ? 0.5 : params.bodyCondition === "overweight" ? -0.5 : 0;
  const finalPercent = base + activityAdj + conditionAdj;
  const grams = params.weightKg * (finalPercent / 100) * 1000;
  return Math.max(1, Math.round(grams));
}
