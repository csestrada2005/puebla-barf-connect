import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ChatMessage, QuickReplies, ChatInput, ChatContainer, DualRecommendation, SubscriptionTiers, BirthdayPicker, WeightPicker } from "@/components/ai";
import { LoginDialog } from "@/components/ai/LoginDialog";
import { useRecommendation } from "@/hooks/useRecommendation";
import { calculateRecommendation, PetData, RecommendationResult } from "@/hooks/useRecommendationCalculator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Package, ShoppingCart } from "lucide-react";

// ==================== TYPE DEFINITIONS ====================

type Step =
  | "initial"
  | "guest_greeting"
  | "smart_menu"
  | "name"
  | "birthday"
  | "weight"
  | "activity"
  | "bodyCondition"
  | "sensitivity"
  | "goal"
  | "result"
  | "profile_entry"
  | "edit_menu"
  | "cancel_reason"
  | "cancel_other_details"
  | "profile_name"
  | "profile_birthday"
  | "profile_weight"
  | "profile_activity"
  | "profile_bodyCondition"
  | "profile_allergies"
  | "profile_goal"
  | "profile_done"
  | "guest_save_prompt";

type InteractionMode = "guest" | "logged_in" | "editing";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
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
  birthday: string | null;
  weightKg: number;
  activity: "low" | "normal" | "high";
  bodyCondition: "underweight" | "ideal" | "overweight";
  allergy: Allergy;
  goal: string;
}

interface ExtendedPetData extends PetData {
  zoneId: string;
  zoneName: string;
  deliveryFee: number;
}

// ==================== STATIC OPTIONS ====================

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
  { value: "chicken", label: "Pollo", emoji: "🍗" },
  { value: "beef", label: "Res", emoji: "🥩" },
  { value: "none", label: "Ninguna", emoji: "✅" },
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

const cancelReasonOptions = [
  { value: "expensive", label: "Muy caro", emoji: "💰" },
  { value: "not_needed", label: "Ya no lo necesito", emoji: "🚫" },
  { value: "delivery_issues", label: "Problemas entrega", emoji: "📦" },
  { value: "diet_change", label: "Cambio dieta", emoji: "🥗" },
  { value: "deceased", label: "Ya no está 🕊️", emoji: "🤍" },
  { value: "other", label: "Otro", emoji: "💬" },
];

// ==================== HELPER FUNCTIONS ====================

function parseBirthdayInput(input: string): string | null {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(input)) return input;

  const dmy = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const padded = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

// Typing delay for more human-like responses
const TYPING_DELAY = 800;
const SENSITIVE_TYPING_DELAY = 1500;

// ==================== MAIN COMPONENT ====================

export default function AIRecomendador() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setRecommendation } = useRecommendation();
  const { addItem } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const consumedIntentRef = useRef(false);
  const initializedRef = useRef(false);

  // ==================== STATE ====================
  
  const [step, setStep] = useState<Step>("initial");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("guest");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginDialogContext, setLoginDialogContext] = useState<"edit" | "save_profile">("edit");
  
  const [messages, setMessages] = useState<Message[]>([]);
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
    goal: "routine",
  });
  const [selectedDog, setSelectedDog] = useState<DogProfileRow | null>(null);
  const [editingDogId, setEditingDogId] = useState<string | null>(null);
  const [singleFieldEdit, setSingleFieldEdit] = useState<string | null>(null);
  const [resultTab, setResultTab] = useState<"subscription" | "oneoff">("subscription");
  const [cancelReason, setCancelReason] = useState<string | null>(null);

  // ==================== DATA QUERIES ====================

  const { data: dogProfiles = [], isLoading: isDogsLoading, refetch: refetchDogs } = useQuery({
    queryKey: ["my-dogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as DogProfileRow[];

      const { data, error } = await supabase
        .from("dog_profiles")
        .select(
          "id,name,birthday,weight_kg,activity_level,body_condition,sensitivity,age_stage,status,daily_grams,weekly_kg,recommended_protein,recommended_plan_type,goal"
        )
        .eq("user_id", user.id)
        .neq("status", "deceased") // Exclude deceased dogs
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as DogProfileRow[];
    },
    enabled: !!user?.id,
  });

  const activeDogs = dogProfiles.filter(d => d.status === "active" || d.status === "paused");

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

  // ==================== HELPER FUNCTIONS ====================

  const addMessage = (content: string, isBot: boolean) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), content, isBot }]);
  };

  const addBotMessage = (content: string, delay = TYPING_DELAY) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        addMessage(content, true);
        resolve();
      }, delay);
    });
  };

  // ==================== INITIALIZATION LOGIC ====================

  // Smart initialization based on auth state and dog profiles
  useEffect(() => {
    if (authLoading) return;
    if (initializedRef.current) return;

    const intent = searchParams.get("intent");
    
    // Check for saved state first (only restore if step === "result")
    const savedState = localStorage.getItem("ai-recommender-state");
    if (savedState && intent !== "new_profile") {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.step === "result") {
          initializedRef.current = true;
          setStep("result");
          setMessages(parsed.messages || []);
          setPetData(parsed.petData || petData);
          setResult(parsed.result || null);
          setInteractionMode(parsed.interactionMode || "guest");
          if (parsed.profileDraft) setProfileDraft(parsed.profileDraft);
          if (parsed.selectedDog) setSelectedDog(parsed.selectedDog);
          return;
        } else {
          localStorage.removeItem("ai-recommender-state");
        }
      } catch (e) {
        console.error("Failed to restore AI state:", e);
        localStorage.removeItem("ai-recommender-state");
      }
    }

    // Handle intent=new_profile
    if (intent === "new_profile") {
      if (!consumedIntentRef.current && !isDogsLoading && isAuthenticated) {
        consumedIntentRef.current = true;
        initializedRef.current = true;
        setSearchParams({});
        localStorage.removeItem("ai-recommender-state");
        setInteractionMode("logged_in");

        if (activeDogs.length === 0) {
          startNewDogFlow();
        } else {
          startProfileEntry();
        }
      }
      return;
    }

    // Wait for dogs loading if authenticated
    if (isAuthenticated && isDogsLoading) return;

    initializedRef.current = true;

    // SMART INITIALIZATION
    if (!isAuthenticated) {
      // GUEST MODE
      setInteractionMode("guest");
      setMessages([{
        id: "guest-greeting",
        content: "¡Hola! 👋 Soy el Dogtor, tu asesor de nutrición canina. ¿Listo para encontrar el plan perfecto para tu mejor amigo? 🐾",
        isBot: true,
      }]);
      setStep("guest_greeting");
    } else {
      // LOGGED IN MODE
      setInteractionMode("logged_in");
      
      if (activeDogs.length === 0) {
        // No dogs yet - start new dog flow directly with single message
        setEditingDogId(null);
        setSelectedDog(null);
        setProfileDraft({
          name: "",
          birthday: null,
          weightKg: 0,
          activity: "normal",
          bodyCondition: "ideal",
          allergy: "none",
          goal: "routine",
        });
        setResult(null);
        setIsResultOpen(false);
        setMessages([{
          id: "welcome-new",
          content: "¡Hola! 👋 Soy el Dogtor, tu asesor de nutrición canina. Veo que aún no tienes perfiles de perritos.\n\n¿Cómo se llama el paciente? 🐾",
          isBot: true,
        }]);
        setStep("profile_name");
      } else {
        // Has dogs - show smart menu
        startSmartMenu();
      }
    }
  }, [authLoading, isAuthenticated, isDogsLoading, activeDogs.length, searchParams]);

  // Save state to localStorage
  useEffect(() => {
    if (step !== "initial" && messages.length > 0) {
      const stateToSave = { 
        step, 
        messages, 
        petData, 
        result, 
        profileDraft, 
        selectedDog,
        interactionMode 
      };
      localStorage.setItem("ai-recommender-state", JSON.stringify(stateToSave));
    }
  }, [step, messages, petData, result, profileDraft, selectedDog, interactionMode]);

  // ==================== FLOW STARTERS ====================

  const startSmartMenu = () => {
    const dogNames = activeDogs.map(d => d.name);
    const nameList = dogNames.length === 1 
      ? dogNames[0] 
      : dogNames.length === 2 
        ? `${dogNames[0]} y ${dogNames[1]}`
        : dogNames.slice(0, -1).join(", ") + ` y ${dogNames[dogNames.length - 1]}`;

    setMessages([{
      id: "smart-menu",
      content: `¡Hola! 🐾 Veo que tienes a ${nameList}. ¿Qué necesitas hoy?`,
      isBot: true,
    }]);
    setStep("smart_menu");
  };

  const startProfileEntry = () => {
    const names = activeDogs.map((d) => d.name).filter(Boolean);
    const list = names.length === 1 
      ? names[0] 
      : names.length === 2 
        ? `${names[0]} y ${names[1]}` 
        : names.slice(0, -1).join(", ") + ` y ${names[names.length - 1]}`;
    
    setMessages([{
      id: "profile-entry",
      content: `Veo que ya tienes a ${list}. 🐶 ¿Qué quieres hacer?`,
      isBot: true,
    }]);
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
          goal: dogToEdit.goal || "routine",
        }
      : {
          name: "",
          birthday: null,
          weightKg: 0,
          activity: "normal",
          bodyCondition: "ideal",
          allergy: "none",
          goal: "routine",
        };

    setEditingDogId(dogToEdit?.id ?? null);
    setSelectedDog(dogToEdit ?? null);
    setProfileDraft(draft);
    setResult(null);
    setIsResultOpen(false);
    setMessages([{
      id: "profile-start",
      content: dogToEdit
        ? `Vamos a actualizar el perfil de ${dogToEdit.name}. ✏️\n\n¿Cómo se llama el paciente? 🐾 (escribe "igual" para mantener)`
        : "¿Cómo se llama el paciente? 🐾",
      isBot: true,
    }]);
    setStep("profile_name");
  };

  const startGuestPlanFlow = () => {
    setMessages(prev => [...prev, {
      id: "guest-plan-start",
      content: "¡Excelente! Vamos a encontrar la dieta perfecta. ¿Cómo se llama tu mejor amigo? 🐾",
      isBot: true,
    }]);
    setStep("name");
  };

  // ==================== DATABASE OPERATIONS ====================

  const upsertDogProfileFromDraft = async (draft: ProfileDraft, goalOverride?: string) => {
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
      goal: goalOverride || draft.goal || "routine",
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
    
    // Refetch dogs list
    queryClient.invalidateQueries({ queryKey: ["my-dogs", user.id] });
    
    return data as DogProfileRow;
  };

  const updateDogStatus = async (dogId: string, status: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("dog_profiles")
      .update({ status })
      .eq("id", dogId);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ["my-dogs", user.id] });
  };

  const saveDogProfile = async (data: ExtendedPetData, recommendation: RecommendationResult) => {
    if (!isAuthenticated || !user) return;
    
    try {
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
      
      queryClient.invalidateQueries({ queryKey: ["my-dogs", user.id] });
    } catch (error) {
      console.error("Failed to save dog profile:", error);
    }
  };

  // ==================== HANDLERS: SMART MENU ====================

  const handleGuestGreetingSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    setTimeout(() => {
      if (value === "start_plan") {
        startGuestPlanFlow();
      }
      setIsProcessing(false);
    }, 400);
  };

  const handleSmartMenuSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    setTimeout(() => {
      if (value === "new_dog") {
        setInteractionMode("logged_in");
        startNewDogFlow();
      } else if (value.startsWith("view_plan:")) {
        const dogId = value.replace("view_plan:", "");
        const dog = activeDogs.find(d => d.id === dogId);
        if (dog) {
          setSelectedDog(dog);
          // Check if dog has daily_grams calculated
          if (dog.daily_grams && dog.daily_grams > 0) {
            // Show plan immediately
            showPlanForDog(dog);
          } else {
            // Need to calculate plan
            addMessage(`Veo que ${dog.name} aún no tiene un plan calculado. ¿Lo hacemos ahora? 🧬`, true);
            setStep("profile_activity"); // Jump to remaining questions
          }
        }
      } else if (value.startsWith("edit:")) {
        const dogId = value.replace("edit:", "");
        const dog = activeDogs.find(d => d.id === dogId);
        if (dog) {
          setSelectedDog(dog);
          setEditingDogId(dog.id);
          setInteractionMode("editing");
          setProfileDraft({
            name: dog.name,
            birthday: dog.birthday,
            weightKg: Number(dog.weight_kg),
            activity: (dog.activity_level as any) || "normal",
            bodyCondition: (dog.body_condition as any) || "ideal",
            allergy: "none",
            goal: dog.goal || "routine",
          });
          addMessage(`¿Qué quieres hacer con ${dog.name}? 🐾`, true);
          setStep("edit_menu");
        }
      }
      setIsProcessing(false);
    }, 400);
  };

  // ==================== HANDLERS: EDIT MENU ====================

  const handleEditMenuSelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    const dog = selectedDog || activeDogs.find((d) => d.id === editingDogId);

    setTimeout(async () => {
      switch (value) {
        case "edit_name":
          setSingleFieldEdit("name");
          addMessage(`¿Cuál es el nuevo nombre? (actual: ${profileDraft.name})`, true);
          setStep("profile_name");
          break;
        case "edit_birthday":
          setSingleFieldEdit("birthday");
          addMessage(`¿Cuándo es su cumpleaños? 🎂 (actual: ${profileDraft.birthday || "sin fecha"})`, true);
          setStep("profile_birthday");
          break;
        case "edit_weight":
          setSingleFieldEdit("weight");
          addMessage(`¿Cuánto pesa ahora? (actual: ${profileDraft.weightKg} kg) ⚖️`, true);
          setStep("profile_weight");
          break;
        case "view_plan":
          setSingleFieldEdit(null);
          if (dog) {
            showPlanForDog(dog);
          }
          break;
        case "cancel_subscription":
          setSingleFieldEdit(null);
          await addBotMessage("Entiendo. ¿Puedo saber el motivo? Esto nos ayuda a mejorar. 🤍", SENSITIVE_TYPING_DELAY);
          setStep("cancel_reason");
          break;
        default:
          break;
      }
      setIsProcessing(false);
    }, 300);
  };

  // ==================== HANDLERS: CANCEL FLOW (SENSITIVE) ====================

  const saveCancellation = async (reason: string, details?: string) => {
    if (!user?.id) return;
    
    const dog = selectedDog || activeDogs.find((d) => d.id === editingDogId);
    
    try {
      await supabase.from("cancellations").insert({
        user_id: user.id,
        dog_profile_id: dog?.id || null,
        subscription_id: null, // Could be enhanced to link to actual subscription
        reason,
        reason_details: details || null,
      });
    } catch (error) {
      console.error("Failed to save cancellation:", error);
    }
  };

  const handleCancelReasonSelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    const dog = selectedDog || activeDogs.find((d) => d.id === editingDogId);

    if (value === "deceased") {
      // CRITICAL: Sensitive case - handle with empathy
      try {
        if (dog) {
          await updateDogStatus(dog.id, "deceased");
        }
        
        // Save cancellation to database
        await saveCancellation("deceased");
        
        // Long typing delay for sensitive response
        await addBotMessage(
          `Lo sentimos mucho. 🤍\n\nHemos pausado todo para ${dog?.name || "tu mascota"} inmediatamente. No recibirás más recordatorios sobre él/ella.\n\nCuando estés listo para cualquier cosa, aquí estaremos. 💙`,
          SENSITIVE_TYPING_DELAY
        );
        
        setStep("initial");
        setSelectedDog(null);
        setEditingDogId(null);
        setCancelReason(null);
        
        // Refresh dog profiles
        refetchDogs();
        
        // End flow - do not ask for more details
        toast({
          title: "Perfil pausado",
          description: `${dog?.name || "El perfil"} ha sido marcado como inactivo.`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else if (value === "other") {
      // Ask for more details
      setCancelReason(value);
      await addBotMessage("¿Quieres contarnos más? Puedes escribir el motivo o simplemente presionar enviar para continuar. 💬", TYPING_DELAY);
      setStep("cancel_other_details");
    } else {
      // Other cancel reasons - pause dog and show farewell message
      try {
        if (dog) {
          await updateDogStatus(dog.id, "paused");
        }
        
        // Save cancellation to database
        await saveCancellation(value);
        
        await addBotMessage(
          `¡Entendido! Lamentamos que te vayas. 🥺\n\nTu suscripción se ha cancelado exitosamente, pero el perfil de ${dog?.name || "tu perrito"} seguirá guardado aquí por si deciden volver a comer rico y sano en el futuro.\n\n¡Hasta pronto! 🐾`,
          TYPING_DELAY
        );
        
        setStep("initial");
        setSelectedDog(null);
        setEditingDogId(null);
        setCancelReason(null);
        
        // Refresh dog profiles
        refetchDogs();
        
        toast({
          title: "Suscripción cancelada",
          description: `El perfil de ${dog?.name || "tu perrito"} ha sido pausado.`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  };

  const handleCancelOtherDetailsSubmit = async (details: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const trimmedDetails = details.trim();
    if (trimmedDetails) {
      addMessage(trimmedDetails, false);
    }

    const dog = selectedDog || activeDogs.find((d) => d.id === editingDogId);

    try {
      if (dog) {
        await updateDogStatus(dog.id, "paused");
      }
      
      // Save cancellation with details to database
      await saveCancellation("other", trimmedDetails || undefined);
      
      await addBotMessage(
        `¡Entendido! Lamentamos que te vayas. 🥺\n\nTu suscripción se ha cancelado exitosamente, pero el perfil de ${dog?.name || "tu perrito"} seguirá guardado aquí por si deciden volver a comer rico y sano en el futuro.\n\n¡Hasta pronto! 🐾`,
        TYPING_DELAY
      );
      
      setStep("initial");
      setSelectedDog(null);
      setEditingDogId(null);
      setCancelReason(null);
      
      // Refresh dog profiles
      refetchDogs();
      
      toast({
        title: "Suscripción cancelada",
        description: `El perfil de ${dog?.name || "tu perrito"} ha sido pausado.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  // ==================== HANDLERS: PROFILE FLOW ====================

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
        const dog = activeDogs.find((d) => d.id === id);
        if (dog) {
          setEditingDogId(dog.id);
          setSelectedDog(dog);
          setInteractionMode("editing");
          setProfileDraft({
            name: dog.name,
            birthday: dog.birthday,
            weightKg: Number(dog.weight_kg),
            activity: (dog.activity_level as any) || "normal",
            bodyCondition: (dog.body_condition as any) || "ideal",
            allergy: "none",
            goal: dog.goal || "routine",
          });
          addMessage(`¿Qué quieres cambiar de ${dog.name}? 🐾`, true);
          setStep("edit_menu");
        }
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    }, 250);
  };

  const handleProfileNameSubmit = async (name: string) => {
    if (isProcessing) return;
    const raw = name.trim();
    const isKeep = !!editingDogId && /^igual$/i.test(raw);
    const nextName = isKeep ? profileDraft.name : raw;
    if (!nextName) return;

    setIsProcessing(true);
    const updatedDraft = { ...profileDraft, name: nextName };
    setProfileDraft(updatedDraft);
    addMessage(isKeep ? `igual (${profileDraft.name})` : nextName, false);

    if (singleFieldEdit === "name") {
      try {
        const saved = await upsertDogProfileFromDraft(updatedDraft);
        await addBotMessage(`¡Listo! ${saved.name} actualizado. ✅`);
        await addBotMessage(`¿Qué más quieres cambiar de ${saved.name}? 🐾`);
        setSingleFieldEdit(null);
        setStep("edit_menu");
      } catch (error: any) {
        toast({ title: "No pude guardar", description: error.message, variant: "destructive" });
        setStep("edit_menu");
      }
      setIsProcessing(false);
      return;
    }

    await addBotMessage("Para calcular su etapa, ¿cuándo es su cumpleaños? 🎂");
    setStep("profile_birthday");
    setIsProcessing(false);
  };

  const handleProfileBirthdaySubmit = async (dateStr: string) => {
    if (isProcessing) return;
    if (!dateStr) return;

    setIsProcessing(true);
    addMessage(dateStr, false);
    const updatedDraft = { ...profileDraft, birthday: dateStr };
    setProfileDraft(updatedDraft);

    if (singleFieldEdit === "birthday") {
      try {
        const saved = await upsertDogProfileFromDraft(updatedDraft);
        await addBotMessage(`¡Listo! Cumpleaños de ${saved.name} actualizado. ✅`);
        await addBotMessage(`¿Qué más quieres cambiar de ${saved.name}? 🐾`);
        setSingleFieldEdit(null);
        setStep("edit_menu");
      } catch (error: any) {
        toast({ title: "No pude guardar", description: error.message, variant: "destructive" });
        setStep("edit_menu");
      }
      setIsProcessing(false);
      return;
    }

    await addBotMessage(`Perfecto, anotado. ¿Cuánto pesa ${profileDraft.name}? ⚖️`);
    setStep("profile_weight");
    setIsProcessing(false);
  };

  const handleProfileWeightSubmit = async (weight: number) => {
    if (isProcessing) return;
    if (!weight || weight <= 0) return;

    setIsProcessing(true);
    const updatedDraft = { ...profileDraft, weightKg: weight };
    setProfileDraft(updatedDraft);
    addMessage(`${weight} kg`, false);

    if (singleFieldEdit === "weight") {
      try {
        const saved = await upsertDogProfileFromDraft(updatedDraft);
        await addBotMessage(`¡Listo! Peso de ${saved.name} actualizado. ✅`);
        await addBotMessage(`¿Qué más quieres cambiar de ${saved.name}? 🐾`);
        setSingleFieldEdit(null);
        setStep("edit_menu");
      } catch (error: any) {
        toast({ title: "No pude guardar", description: error.message, variant: "destructive" });
        setStep("edit_menu");
      }
      setIsProcessing(false);
      return;
    }

    await addBotMessage(`Muy bien. ¿Qué tan activo es ${profileDraft.name}? 🏃`);
    setStep("profile_activity");
    setIsProcessing(false);
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
    setTimeout(async () => {
      await addBotMessage(`Ahora una pregunta importante. ¿Cómo describirías la condición corporal de ${profileDraft.name}? ⚖️`);
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
    setTimeout(async () => {
      await addBotMessage(`Entendido. ¿${profileDraft.name} tiene alergias conocidas? 🤧`);
      setStep("profile_allergies");
      setIsProcessing(false);
    }, 350);
  };

  const handleProfileAllergySelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    const nextDraft = { ...profileDraft, allergy: value as Allergy };
    setProfileDraft(nextDraft);

    // Go to goal selection instead of photo
    await addBotMessage(`¡Okay! Última pregunta: ¿Cuál es tu objetivo con la dieta BARF para ${profileDraft.name}? 🎯`);
    setStep("profile_goal");
    setIsProcessing(false);
  };

  const handleProfileGoalSelect = async (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    const nextDraft = { ...profileDraft, goal: value };
    setProfileDraft(nextDraft);

    try {
      const saved = await upsertDogProfileFromDraft(nextDraft, value);
      await addBotMessage(`¡Listo! Perfil de ${saved.name} guardado con éxito. ✅`);
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
      const ageStage = profileDraft.birthday ? getAgeStageFromBirthday(profileDraft.birthday) : "adult";
      const updatedPetData: ExtendedPetData = {
        ...petData,
        name: profileDraft.name,
        weight: profileDraft.weightKg,
        age: ageStage,
        activity: profileDraft.activity,
        bodyCondition: profileDraft.bodyCondition,
        sensitivity: profileDraft.allergy === "none" ? "low" : "high",
        goal: profileDraft.goal || "routine",
        zoneId: "",
        zoneName: "",
        deliveryFee: 0,
      };
      setPetData(updatedPetData);

      if (products && products.length > 0) {
        const recommendation = calculateRecommendation(updatedPetData, products);
        setResult(recommendation);
        await addBotMessage(`🧬 ¡Análisis completo! Aquí está el plan personalizado para ${updatedPetData.name} 🎉`);
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

  // ==================== HANDLERS: GUEST PLAN FLOW ====================

  const handleNameSubmit = (name: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, name }));
    addMessage(name, false);
    setTimeout(async () => {
      await addBotMessage(`¡Encantado de conocer a ${name}! 🐾 ¿Cuándo nació?`);
      setStep("birthday");
      setIsProcessing(false);
    }, 400);
  };

  const handleBirthdaySubmit = (dateStr: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const ageStage = getAgeStageFromBirthday(dateStr);
    setPetData(prev => ({ ...prev, age: ageStage }));
    addMessage(dateStr, false);
    setTimeout(async () => {
      await addBotMessage(`Perfecto, anotado. ¿Cuánto pesa ${petData.name}? ⚖️`);
      setStep("weight");
      setIsProcessing(false);
    }, 400);
  };

  const handleWeightSubmit = (weight: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, weight }));
    addMessage(`${weight} kg`, false);
    setTimeout(async () => {
      await addBotMessage(`Muy bien. ¿Qué tan activo es ${petData.name}? 🏃`);
      setStep("activity");
      setIsProcessing(false);
    }, 400);
  };

  const handleActivitySelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, activity: value }));
    addMessage(label, false);
    setTimeout(async () => {
      await addBotMessage(`Ahora una pregunta importante para su nutrición. ¿Cómo describirías la condición corporal de ${petData.name}? ⚖️`);
      setStep("bodyCondition");
      setIsProcessing(false);
    }, 400);
  };

  const handleBodyConditionSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPetData(prev => ({ ...prev, bodyCondition: value }));
    addMessage(label, false);
    setTimeout(async () => {
      await addBotMessage(`Entendido. ¿${petData.name} tiene alergias conocidas? 🤧`);
      setStep("sensitivity");
      setIsProcessing(false);
    }, 400);
  };

  const handleSensitivitySelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    // Map allergy value to sensitivity for petData
    const sensitivityValue = value === "none" ? "low" : "high";
    setPetData(prev => ({ ...prev, sensitivity: sensitivityValue }));
    addMessage(label, false);
    setTimeout(async () => {
      await addBotMessage(`¡Okay! Última pregunta: ¿Cuál es tu objetivo con la dieta BARF para ${petData.name}? 🎯`);
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
        if (isAuthenticated) {
          await saveDogProfile(updatedPetData, recommendation);
        }
        
        await addBotMessage(`🧬 ¡Análisis completo! Aquí está el plan personalizado para ${updatedPetData.name} 🎉`);
        
        // GUEST MODE HOOK: Prompt to save profile
        if (interactionMode === "guest") {
          setStep("guest_save_prompt");
        } else {
          setStep("result");
        }
      }
      setIsProcessing(false);
    }, TYPING_DELAY);
  };

  const handleGuestSavePromptSelect = (value: string, label: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    addMessage(label, false);

    setTimeout(() => {
      if (value === "save_yes") {
        // Save petData to localStorage for after login
        localStorage.setItem("pending-dog-profile", JSON.stringify(petData));
        setLoginDialogContext("save_profile");
        setShowLoginDialog(true);
      }
      setStep("result");
      setIsProcessing(false);
    }, 400);
  };

  // ==================== PLAN DISPLAY ====================

  const showPlanForDog = (dog: DogProfileRow) => {
    if (!products || products.length === 0) {
      toast({
        title: "No hay productos disponibles",
        description: "No se puede generar el plan en este momento.",
        variant: "destructive",
      });
      return;
    }

    const ageStage = dog.birthday ? getAgeStageFromBirthday(dog.birthday) : (dog.age_stage as any) || "adult";
    const updatedPetData: ExtendedPetData = {
      name: dog.name,
      weight: Number(dog.weight_kg),
      age: ageStage,
      activity: dog.activity_level || "normal",
      bodyCondition: dog.body_condition || "ideal",
      sensitivity: dog.sensitivity || "low",
      goal: dog.goal || "routine",
      zoneId: "",
      zoneName: "",
      deliveryFee: 0,
    };
    setPetData(updatedPetData);
    
    const recommendation = calculateRecommendation(updatedPetData, products);
    setResult(recommendation);
    addMessage(`🧬 ¡Aquí está el plan actualizado para ${dog.name}! 🎉`, true);
    setStep("result");
    setIsResultOpen(true);
  };

  // ==================== CART & SUBSCRIPTION ====================

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

  const handleSelectSubscription = (planType: "monthly" | "annual") => {
    if (!isAuthenticated || !user) {
      setLoginDialogContext("edit");
      setShowLoginDialog(true);
      toast({
        title: "Inicia sesión para suscribirte",
        description: "Necesitas una cuenta para crear tu suscripción.",
      });
      return;
    }

    const proteinLine = result?.recommendedProtein === "chicken" ? "pollo" : result?.recommendedProtein === "beef" ? "res" : "mix";
    const presentation = result?.weeklyKg && result.weeklyKg >= 3 ? "1kg" : "500g";
    const discountPercent = planType === "annual" ? 15 : 0;
    const pricePerKg = 150;
    const weeklyKg = result?.weeklyKg || 1;
    
    // Calculate monthly price (4 weeks)
    const baseMonthlyPrice = weeklyKg * pricePerKg * 4;
    const finalPrice = Math.round(baseMonthlyPrice * (1 - discountPercent / 100));

    const subscriptionItem = {
      id: `subscription-${planType}-${proteinLine}-${presentation}`,
      name: `Suscripción ${planType === "annual" ? "Anual" : "Mensual"} - BARF ${proteinLine === "pollo" ? "Pollo" : "Res"} ${presentation}`,
      price: finalPrice,
      isSubscription: true,
      subscriptionDetails: {
        planType,
        proteinLine,
        presentation,
        frequency: "mensual",
        weeklyKg,
        discountPercent,
      },
    };

    addItem(subscriptionItem);
    
    toast({
      title: "Plan agregado al carrito 🛒",
      description: `Tu suscripción ${planType === "annual" ? "anual" : "mensual"} está lista para pagar.`,
    });

    setIsResultOpen(false);
    navigate("/carrito");
  };

  const handleViewProduct = (productSlug: string) => {
    navigate(`/producto/${productSlug}`);
  };

  const handleRestart = () => {
    localStorage.removeItem("ai-recommender-state");
    initializedRef.current = false;
    consumedIntentRef.current = false;
    
    setMessages([]);
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
    setSelectedDog(null);
    setEditingDogId(null);
    setSingleFieldEdit(null);
    setStep("initial");
    
    // Re-trigger initialization
    setTimeout(() => {
      if (!isAuthenticated) {
        setInteractionMode("guest");
        setMessages([{
          id: "guest-greeting",
          content: "¡Hola! 👋 Soy el Dogtor, tu asesor de nutrición canina. ¿Listo para encontrar el plan perfecto para tu mejor amigo? 🐾",
          isBot: true,
        }]);
        setStep("guest_greeting");
        initializedRef.current = true;
      } else {
        setInteractionMode("logged_in");
        if (activeDogs.length === 0) {
          startNewDogFlow();
        } else {
          startSmartMenu();
        }
        initializedRef.current = true;
      }
    }, 100);
  };

  const handleLoginSuccess = () => {
    // Check if there's a pending profile to save
    const pendingProfile = localStorage.getItem("pending-dog-profile");
    if (pendingProfile && loginDialogContext === "save_profile") {
      // Profile will be saved on next render when isAuthenticated becomes true
      toast({
        title: "¡Perfil guardado!",
        description: "Tu perfil ha sido guardado en tu cuenta.",
      });
      localStorage.removeItem("pending-dog-profile");
    }
    
    // Refetch dogs
    refetchDogs();
    
    // Update interaction mode
    setInteractionMode("logged_in");
  };

  // ==================== RENDER INPUT SECTION ====================

  const renderInputSection = () => {
    if (step === "result" || step === "initial") return null;
    
    switch (step) {
      case "guest_greeting":
        return (
          <QuickReplies
            options={[{ value: "start_plan", label: "Iniciar", emoji: "🥗" }]}
            onSelect={handleGuestGreetingSelect}
            columns={2}
            disabled={isProcessing}
          />
        );
      
      case "smart_menu": {
        const options = [
          ...activeDogs.map((d) => ({ value: `view_plan:${d.id}`, label: `Ver Plan de ${d.name}`, emoji: "📄" })),
          ...activeDogs.map((d) => ({ value: `edit:${d.id}`, label: `Editar ${d.name}`, emoji: "✏️" })),
          { value: "new_dog", label: "Nuevo Perro", emoji: "➕" },
        ];
        return <QuickReplies options={options} onSelect={handleSmartMenuSelect} columns={2} disabled={isProcessing} />;
      }

      case "profile_entry": {
        const options = [
          ...activeDogs.map((d) => ({ value: `edit:${d.id}`, label: `Editar ${d.name}`, emoji: "✏️" })),
          { value: "new", label: "Agregar Nuevo", emoji: "➕" },
        ];
        return <QuickReplies options={options} onSelect={handleProfileEntrySelect} columns={2} disabled={isProcessing} />;
      }

      case "edit_menu": {
        const editMenuOptions = [
          { value: "edit_name", label: "Cambiar Nombre", emoji: "✏️" },
          { value: "edit_birthday", label: "Cambiar Edad", emoji: "🎂" },
          { value: "edit_weight", label: "Cambiar Peso", emoji: "⚖️" },
          { value: "view_plan", label: "Ver Plan", emoji: "📄" },
          { value: "cancel_subscription", label: "Cancelar", emoji: "❌" },
        ];
        return <QuickReplies options={editMenuOptions} onSelect={handleEditMenuSelect} columns={2} disabled={isProcessing} />;
      }

      case "cancel_reason":
        return <QuickReplies options={cancelReasonOptions} onSelect={handleCancelReasonSelect} columns={2} disabled={isProcessing} />;

      case "cancel_other_details":
        return <ChatInput placeholder="Cuéntanos más (opcional)..." onSubmit={handleCancelOtherDetailsSubmit} disabled={isProcessing} allowEmpty />;

      case "guest_save_prompt":
        return (
          <QuickReplies
            options={[
              { value: "save_yes", label: "Sí, guardar perfil", emoji: "✅" },
              { value: "save_no", label: "No, solo ver plan", emoji: "👀" },
            ]}
            onSelect={handleGuestSavePromptSelect}
            columns={2}
            disabled={isProcessing}
          />
        );

      case "profile_name":
        return <ChatInput placeholder="Nombre del perrito…" onSubmit={handleProfileNameSubmit} disabled={isProcessing} />;
      case "profile_birthday":
        return <BirthdayPicker onSubmit={handleProfileBirthdaySubmit} disabled={isProcessing} />;
      case "profile_weight":
        return <WeightPicker onSubmit={handleProfileWeightSubmit} disabled={isProcessing} initialValue={profileDraft.weightKg || 10} />;
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
      case "profile_goal":
        return <QuickReplies options={goalOptions} onSelect={handleProfileGoalSelect} columns={3} disabled={isProcessing} />;
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
      case "birthday":
        return <BirthdayPicker onSubmit={handleBirthdaySubmit} disabled={isProcessing} />;
      case "weight":
        return <WeightPicker onSubmit={handleWeightSubmit} disabled={isProcessing} />;
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

  // ==================== MAIN RENDER ====================

  return (
    <Layout hideFooter hideFab>
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

        {step === "guest_save_prompt" && result && (
          <div className="w-full px-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Te gustaría guardar el perfil de <strong>{petData.name}</strong> para futuras compras? 🐾
              </p>
            </div>
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

      {/* Login Dialog for in-chat authentication */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title={loginDialogContext === "save_profile" ? "Guarda tu perfil" : "Inicia sesión para continuar"}
        description={
          loginDialogContext === "save_profile"
            ? `Para guardar el perfil de ${petData.name}, inicia sesión o regístrate.`
            : "Necesitas una cuenta para acceder a esta función."
        }
        onSuccess={handleLoginSuccess}
      />
    </Layout>
  );
}
