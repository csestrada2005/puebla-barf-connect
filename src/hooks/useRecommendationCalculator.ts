interface PetData {
  name: string;
  weight: number;
  age: string;
  activity: string;
  goal: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  quantity: number;
  presentation: string;
}

interface RecommendationResult {
  dailyGrams: number;
  weeklyKg: number;
  monthlyKg: number;
  planType: "standard" | "premium";
  optionA: {
    title: string;
    subtitle: string;
    products: ProductOption[];
    totalPrice: number;
    badge: string;
    isRecommended: boolean;
    durationDays: number;
  };
  optionB: {
    title: string;
    subtitle: string;
    products: ProductOption[];
    totalPrice: number;
    durationDays: number;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  protein_line?: string | null;
  presentation?: string | null;
}

export function calculateDailyGrams(weight: number, age: string, activity: string): number {
  // Puppies: 6% of body weight
  if (age === "puppy") {
    return Math.round(weight * 0.06 * 1000);
  }
  
  // Senior: 2.5% of body weight
  if (age === "senior") {
    return Math.round(weight * 0.025 * 1000);
  }
  
  // Adults based on activity level
  const activityMultipliers: Record<string, number> = {
    low: 0.025,    // 2.5%
    normal: 0.03,  // 3%
    high: 0.04,    // 4%
  };
  
  return Math.round(weight * (activityMultipliers[activity] || 0.03) * 1000);
}

export function calculateRecommendation(
  petData: PetData,
  products: Product[]
): RecommendationResult {
  const dailyGrams = calculateDailyGrams(petData.weight, petData.age, petData.activity);
  const weeklyKg = (dailyGrams * 7) / 1000;
  const monthlyKg = (dailyGrams * 30) / 1000;
  
  // Determine plan type based on goal
  const planType = petData.goal === "premium" ? "premium" : "standard";
  
  // Get products by type
  const pollo500 = products.find(p => p.protein_line === "pollo" && p.presentation === "500g");
  const pollo1kg = products.find(p => p.protein_line === "pollo" && p.presentation === "1kg");
  const res500 = products.find(p => p.protein_line === "res" && p.presentation === "500g");
  const res1kg = products.find(p => p.protein_line === "res" && p.presentation === "1kg");
  
  // Calculate packages needed for 2 weeks (Option A) and 1 week (Option B)
  const twoWeekGrams = dailyGrams * 14;
  const oneWeekGrams = dailyGrams * 7;
  
  // Option A: Premium - 2 weeks supply with 1kg packages (better value)
  const optionAProducts: ProductOption[] = [];
  let optionATotalPrice = 0;
  
  if (planType === "premium" && res1kg) {
    const resPackages = Math.ceil(twoWeekGrams / 2 / 1000); // Half res, half pollo
    const polloPackages = Math.ceil(twoWeekGrams / 2 / 1000);
    
    if (res1kg) {
      optionAProducts.push({
        id: res1kg.id,
        name: res1kg.name,
        price: Number(res1kg.price),
        quantity: resPackages,
        presentation: "1kg",
      });
      optionATotalPrice += Number(res1kg.price) * resPackages;
    }
    if (pollo1kg) {
      optionAProducts.push({
        id: pollo1kg.id,
        name: pollo1kg.name,
        price: Number(pollo1kg.price),
        quantity: polloPackages,
        presentation: "1kg",
      });
      optionATotalPrice += Number(pollo1kg.price) * polloPackages;
    }
  } else if (pollo1kg) {
    const packages = Math.ceil(twoWeekGrams / 1000);
    optionAProducts.push({
      id: pollo1kg.id,
      name: pollo1kg.name,
      price: Number(pollo1kg.price),
      quantity: packages,
      presentation: "1kg",
    });
    optionATotalPrice = Number(pollo1kg.price) * packages;
  }
  
  // Option B: Budget - 1 week supply with 500g packages (lower initial investment)
  const optionBProducts: ProductOption[] = [];
  let optionBTotalPrice = 0;
  
  if (pollo500) {
    const packages = Math.ceil(oneWeekGrams / 500);
    optionBProducts.push({
      id: pollo500.id,
      name: pollo500.name,
      price: Number(pollo500.price),
      quantity: packages,
      presentation: "500g",
    });
    optionBTotalPrice = Number(pollo500.price) * packages;
  }
  
  // Calculate duration for each option
  const optionATotalGrams = optionAProducts.reduce((acc, p) => {
    const grams = p.presentation === "1kg" ? 1000 : 500;
    return acc + (grams * p.quantity);
  }, 0);
  const optionADurationDays = Math.floor(optionATotalGrams / dailyGrams);
  
  const optionBTotalGrams = optionBProducts.reduce((acc, p) => {
    const grams = p.presentation === "1kg" ? 1000 : 500;
    return acc + (grams * p.quantity);
  }, 0);
  const optionBDurationDays = Math.floor(optionBTotalGrams / dailyGrams);
  
  return {
    dailyGrams,
    weeklyKg,
    monthlyKg,
    planType,
    optionA: {
      title: "Opción A: Mejor Valor",
      subtitle: "Más práctico, mejor resultado, ~2 semanas",
      products: optionAProducts,
      totalPrice: optionATotalPrice,
      badge: "✨ Recomendado",
      isRecommended: true,
      durationDays: optionADurationDays,
    },
    optionB: {
      title: "Opción B: Para Empezar",
      subtitle: "Menor inversión inicial, ~1 semana",
      products: optionBProducts,
      totalPrice: optionBTotalPrice,
      durationDays: optionBDurationDays,
    },
  };
}
