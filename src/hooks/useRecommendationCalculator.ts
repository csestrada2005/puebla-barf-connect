// Types for the enhanced recommendation system
export interface PetData {
  name: string;
  weight: number;
  age: string; // puppy, adult, senior
  birthday?: string; // ISO date string for exact age calculation
  activity: string; // low, normal, high
  bodyCondition: string; // underweight, ideal, overweight
  sensitivity: string; // high, medium, low
  goal: string; // trial, routine, variety
  allergy?: "chicken" | "beef" | "none";
  isSterilized?: boolean;
  isSportDog?: boolean;
}

export interface ProductOption {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  presentation: string;
}

export interface RecommendationOption {
  title: string;
  subtitle: string;
  products: ProductOption[];
  totalPrice: number;
  badge?: string;
  isRecommended?: boolean;
  durationDays: number;
}

export interface RecommendationResult {
  dailyGrams: number;
  weeklyKg: number;
  monthlyKg: number;
  planType: "standard" | "premium";
  recommendedProtein: "chicken" | "beef" | "mix";
  hasAllergy: boolean; // NEW: indicates if user has an allergy
  optionA: RecommendationOption;
  optionB: RecommendationOption;
  // NEW: Alternative protein options for when no allergy (premium=beef, economico=chicken)
  optionA_alt?: RecommendationOption;
  optionB_alt?: RecommendationOption;
  reasoning: RecommendationReasoning;
}

export interface RecommendationReasoning {
  planReason: string;
  proteinReason: string;
  dailyGramsReason: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  protein_line?: string | null;
  presentation?: string | null;
}

// ===== FORMULA CALCULATIONS =====

/**
 * Calculate the exact age in months from a birthday ISO string.
 * Returns null if birthday is not provided or invalid.
 */
export function getMonthsOld(birthday: string | undefined): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth()) +
    (today.getDate() < birth.getDate() ? -1 : 0);

  return Math.max(0, months);
}

/**
 * Get the feeding percentage for puppies based on exact age in months.
 *  2-4 months: 10%
 *  4-6 months: 8%
 *  6-8 months: 6%
 *  8-10 months: 4%
 * 10-12 months: 3%
 */
function getPuppyPercentage(months: number): number {
  if (months < 4) return 10;
  if (months < 6) return 8;
  if (months < 8) return 6;
  if (months < 10) return 4;
  return 3; // 10-12 months
}

/**
 * Get the feeding percentage for adult dogs based on activity, sterilization, and sport status.
 *
 * Priority order:
 *  1. isSportDog (Minis, Deportistas, Galgos) → 3.5%
 *  2. isSterilized OR low activity → 2%
 *  3. High activity or nervous → 3%
 *  4. Normal activity → 2.5%
 */
function getAdultPercentage(
  activity: string,
  isSterilized?: boolean,
  isSportDog?: boolean
): number {
  if (isSportDog) return 3.5;
  if (isSterilized || activity === "low") return 2.0;
  if (activity === "high") return 3.0;
  return 2.5; // normal activity
}

/**
 * Calculate daily grams using the new veterinary rules:
 * - Puppies (<12 months): percentage based on exact month range
 * - Adults (≥12 months): percentage based on activity/sterilization/sport
 *
 * Grams/Day = Weight * (percentage / 100) * 1000
 */
export function calculateDailyGrams(
  weight: number,
  age: string,
  activity: string,
  bodyCondition: string,
  birthday?: string,
  isSterilized?: boolean,
  isSportDog?: boolean
): number {
  const months = getMonthsOld(birthday);
  let percentage: number;

  // Puppy logic takes priority when we have exact birthday data
  if (months !== null && months < 12) {
    percentage = getPuppyPercentage(months);
  } else if (age === "puppy" && months === null) {
    // Fallback for puppies without birthday — use midpoint 6%
    percentage = 6.0;
  } else {
    // Adult / Senior
    percentage = getAdultPercentage(activity, isSterilized, isSportDog);
  }

  const dailyGrams = weight * (percentage / 100) * 1000;
  return Math.round(dailyGrams);
}

// ===== PLAN TYPE LOGIC =====

/**
 * Determine plan type based on business rules:
 * 
 * STANDARD: If Sensitivity is High OR Goal is "Trial/Routine" OR Body Condition is Overweight
 * PREMIUM (Mix): If Sensitivity is Low AND (Goal is "Variety" OR Activity is High)
 */
export function determinePlanType(
  sensitivity: string,
  goal: string,
  bodyCondition: string,
  activity: string
): "standard" | "premium" {
  // Standard conditions
  if (sensitivity === "high") return "standard";
  if (goal === "trial" || goal === "routine") return "standard";
  if (bodyCondition === "overweight") return "standard";
  
  // Premium conditions
  if (sensitivity === "low" && (goal === "variety" || activity === "high")) {
    return "premium";
  }
  
  // Default to standard
  return "standard";
}

// ===== PROTEIN LOGIC =====

/**
 * Determine recommended protein based on business rules:
 * 
 * Chicken: Sensitive dogs OR Overweight dogs
 * Beef: Underweight dogs OR High Performance dogs
 * Mix: Premium plan (variety seekers)
 */
export function determineProtein(
  sensitivity: string,
  bodyCondition: string,
  activity: string,
  planType: "standard" | "premium"
): "chicken" | "beef" | "mix" {
  // Sensitive or overweight → Chicken (easier to digest)
  if (sensitivity === "high" || bodyCondition === "overweight") {
    return "chicken";
  }
  
  // Underweight or high activity → Beef (more caloric, protein-dense)
  if (bodyCondition === "underweight" || activity === "high") {
    return "beef";
  }
  
  // Premium plan → Mix for variety
  if (planType === "premium") {
    return "mix";
  }
  
  // Default to chicken (standard, most digestible)
  return "chicken";
}

// ===== CART OPTIONS LOGIC =====

/**
 * Calculate the total price for a given duration and protein
 * This consolidates all products into a single "portion" item
 */
function calculatePortionPrice(
  dailyGrams: number,
  products: Product[],
  protein: "chicken" | "beef" | "mix",
  targetDays: number
): { totalPrice: number; actualGrams: number } {
  const totalGrams = dailyGrams * targetDays;
  let totalPrice = 0;
  let actualGrams = 0;
  
  if (protein === "mix") {
    const halfGrams = totalGrams / 2;
    
    // Chicken portion
    const pollo1kg = products.find(p => p.protein_line === "pollo" && p.presentation === "1kg");
    const pollo500 = products.find(p => p.protein_line === "pollo" && p.presentation === "500g");
    
    if (pollo1kg) {
      const packs1kg = Math.floor(halfGrams / 1000);
      const remainder = halfGrams % 1000;
      
      if (packs1kg > 0) {
        totalPrice += Number(pollo1kg.price) * packs1kg;
        actualGrams += packs1kg * 1000;
      }
      
      if (remainder > 0 && pollo500) {
        const packs500 = Math.ceil(remainder / 500);
        totalPrice += Number(pollo500.price) * packs500;
        actualGrams += packs500 * 500;
      }
    }
    
    // Beef portion
    const res1kg = products.find(p => p.protein_line === "res" && p.presentation === "1kg");
    const res500 = products.find(p => p.protein_line === "res" && p.presentation === "500g");
    
    if (res1kg) {
      const packs1kg = Math.floor(halfGrams / 1000);
      const remainder = halfGrams % 1000;
      
      if (packs1kg > 0) {
        totalPrice += Number(res1kg.price) * packs1kg;
        actualGrams += packs1kg * 1000;
      }
      
      if (remainder > 0 && res500) {
        const packs500 = Math.ceil(remainder / 500);
        totalPrice += Number(res500.price) * packs500;
        actualGrams += packs500 * 500;
      }
    }
  } else {
    const proteinLine = protein === "chicken" ? "pollo" : "res";
    const product1kg = products.find(p => p.protein_line === proteinLine && p.presentation === "1kg");
    const product500 = products.find(p => p.protein_line === proteinLine && p.presentation === "500g");
    
    if (product1kg) {
      const packs1kg = Math.floor(totalGrams / 1000);
      const remainder = totalGrams % 1000;
      
      if (packs1kg > 0) {
        totalPrice += Number(product1kg.price) * packs1kg;
        actualGrams += packs1kg * 1000;
      }
      
      if (remainder > 0 && product500) {
        const packs500 = Math.ceil(remainder / 500);
        totalPrice += Number(product500.price) * packs500;
        actualGrams += packs500 * 500;
      }
    } else if (product500) {
      const packs = Math.ceil(totalGrams / 500);
      totalPrice += Number(product500.price) * packs;
      actualGrams += packs * 500;
    }
  }
  
  return { totalPrice, actualGrams };
}

/**
 * Calculate Option A (Best Value): 14 days (Quincenal)
 * Returns a single consolidated "Porción Quincenal" product
 */
function calculateOptionA(
  dailyGrams: number,
  products: Product[],
  protein: "chicken" | "beef" | "mix"
): { products: ProductOption[]; totalPrice: number; durationDays: number } {
  const targetDays = 14;
  const { totalPrice, actualGrams } = calculatePortionPrice(dailyGrams, products, protein, targetDays);
  
  const proteinLabel = protein === "chicken" ? "Pollo" : protein === "beef" ? "Res" : "Mix";
  const totalKg = Math.round(actualGrams / 100) / 10; // Convert to kg with 1 decimal
  
  // Find a base product for the slug
  const proteinLine = protein === "chicken" ? "pollo" : protein === "beef" ? "res" : "pollo";
  const baseProduct = products.find(p => p.protein_line === proteinLine);
  
  const optionProducts: ProductOption[] = [{
    id: `porcion-quincenal-${protein}`,
    slug: baseProduct?.slug || `barf-${proteinLine}-500g`,
    name: `Porción Quincenal BARF ${proteinLabel} (${totalKg}kg)`,
    price: totalPrice,
    quantity: 1,
    presentation: "quincenal",
  }];
  
  const durationDays = actualGrams > 0 ? Math.floor(actualGrams / dailyGrams) : targetDays;
  
  return { products: optionProducts, totalPrice, durationDays };
}

/**
 * Calculate Option B (Low Investment): 7 days (Semanal)
 * Returns a single consolidated "Porción Semanal" product
 */
function calculateOptionB(
  dailyGrams: number,
  products: Product[],
  protein: "chicken" | "beef" | "mix"
): { products: ProductOption[]; totalPrice: number; durationDays: number } {
  const targetDays = 7;
  const { totalPrice, actualGrams } = calculatePortionPrice(dailyGrams, products, protein, targetDays);
  
  const proteinLabel = protein === "chicken" ? "Pollo" : protein === "beef" ? "Res" : "Mix";
  const totalKg = Math.round(actualGrams / 100) / 10; // Convert to kg with 1 decimal
  
  // Find a base product for the slug
  const proteinLine = protein === "chicken" ? "pollo" : protein === "beef" ? "res" : "pollo";
  const baseProduct = products.find(p => p.protein_line === proteinLine);
  
  const optionProducts: ProductOption[] = [{
    id: `porcion-semanal-${protein}`,
    slug: baseProduct?.slug || `barf-${proteinLine}-500g`,
    name: `Porción Semanal BARF ${proteinLabel} (${totalKg}kg)`,
    price: totalPrice,
    quantity: 1,
    presentation: "semanal",
  }];
  
  const durationDays = actualGrams > 0 ? Math.floor(actualGrams / dailyGrams) : targetDays;
  
  return { products: optionProducts, totalPrice, durationDays };
}

// ===== REASONING GENERATION =====

function generateReasoning(
  petData: PetData,
  planType: "standard" | "premium",
  protein: "chicken" | "beef" | "mix",
  dailyGrams: number
): RecommendationReasoning {
  let planReason = "";
  let proteinReason = "";
  let dailyGramsReason = "";
  
  // Plan reasoning
  if (planType === "premium") {
    planReason = `Elegimos el Plan Premium porque ${petData.name} tiene baja sensibilidad y ${petData.goal === "variety" ? "busca variedad" : "es muy activo"}.`;
  } else {
    if (petData.sensitivity === "high") {
      planReason = `Elegimos el Plan Standard porque ${petData.name} tiene alta sensibilidad digestiva.`;
    } else if (petData.bodyCondition === "overweight") {
      planReason = `Elegimos el Plan Standard para ayudar a ${petData.name} a alcanzar su peso ideal.`;
    } else {
      planReason = `Elegimos el Plan Standard ideal para ${petData.goal === "trial" ? "probar la dieta BARF" : "establecer una rutina alimenticia"}.`;
    }
  }
  
  // Protein reasoning
  if (protein === "chicken") {
    if (petData.sensitivity === "high") {
      proteinReason = `Recomendamos Pollo porque es más fácil de digerir para perritos con sensibilidad.`;
    } else if (petData.bodyCondition === "overweight") {
      proteinReason = `Recomendamos Pollo porque es más ligero y ayudará a ${petData.name} a alcanzar su peso ideal.`;
    } else {
      proteinReason = `Recomendamos Pollo como proteína base ideal para empezar.`;
    }
  } else if (protein === "beef") {
    if (petData.bodyCondition === "underweight") {
      proteinReason = `Recomendamos Res porque es más calórica y ayudará a ${petData.name} a ganar peso saludable.`;
    } else if (petData.activity === "high") {
      proteinReason = `Recomendamos Res porque proporciona más energía para ${petData.name} con su alta actividad.`;
    } else {
      proteinReason = `Recomendamos Res como proteína premium para ${petData.name}.`;
    }
  } else {
    proteinReason = `Recomendamos Mix (Pollo + Res) para ofrecer variedad nutricional a ${petData.name}.`;
  }
  
  // Daily grams reasoning
  const ageLabel = petData.age === "puppy" ? "cachorro" : petData.age === "senior" ? "senior" : "adulto";
  dailyGramsReason = `${dailyGrams}g diarios calculados para un ${ageLabel} de ${petData.weight}kg con actividad ${petData.activity === "low" ? "baja" : petData.activity === "high" ? "alta" : "normal"}.`;
  
  return { planReason, proteinReason, dailyGramsReason };
}

// ===== MAIN CALCULATION FUNCTION =====

export function calculateRecommendation(
  petData: PetData,
  products: Product[]
): RecommendationResult {
  // Calculate daily grams with veterinary formula
  const dailyGrams = calculateDailyGrams(
    petData.weight,
    petData.age,
    petData.activity,
    petData.bodyCondition,
    petData.birthday,
    petData.isSterilized,
    petData.isSportDog
  );
  
  const weeklyKg = Math.ceil(((dailyGrams * 7) / 1000) * 2) / 2; // Round up to nearest 0.5kg
  const monthlyKg = (dailyGrams * 30) / 1000;
  
  // Determine plan type and protein
  const planType = determinePlanType(
    petData.sensitivity,
    petData.goal,
    petData.bodyCondition,
    petData.activity
  );
  
  // Check for allergies and determine protein accordingly
  const allergy = petData.allergy || "none";
  const hasAllergy = allergy !== "none";
  
  let recommendedProtein: "chicken" | "beef" | "mix";
  
  if (allergy === "chicken") {
    // Allergic to chicken → ONLY offer beef
    recommendedProtein = "beef";
  } else if (allergy === "beef") {
    // Allergic to beef → ONLY offer chicken
    recommendedProtein = "chicken";
  } else {
    // No allergy → use standard determination (default to chicken as "económico")
    recommendedProtein = determineProtein(
      petData.sensitivity,
      petData.bodyCondition,
      petData.activity,
      planType
    );
  }
  
  // When NO allergy: always use chicken for base (económico) and beef for alt (premium)
  // When allergy: use the single allowed protein
  const baseProtein: "chicken" | "beef" = hasAllergy 
    ? recommendedProtein as "chicken" | "beef"
    : "chicken";
  
  const optionAData = calculateOptionA(dailyGrams, products, baseProtein);
  const optionBData = calculateOptionB(dailyGrams, products, baseProtein);
  
  // Generate reasoning
  const reasoning = generateReasoning(petData, planType, recommendedProtein, dailyGrams);
  
  // Build base result
  const result: RecommendationResult = {
    dailyGrams,
    weeklyKg,
    monthlyKg,
    planType,
    recommendedProtein,
    hasAllergy,
    optionA: {
      title: "Porción Quincenal",
      subtitle: hasAllergy 
        ? `BARF ${recommendedProtein === "beef" ? "Res" : "Pollo"} - ~2 semanas`
        : "Mejor valor, ~2 semanas",
      products: optionAData.products,
      totalPrice: optionAData.totalPrice,
      badge: "✨ Mejor Valor",
      isRecommended: true,
      durationDays: optionAData.durationDays,
    },
    optionB: {
      title: "Porción Semanal",
      subtitle: hasAllergy 
        ? `BARF ${recommendedProtein === "beef" ? "Res" : "Pollo"} - ~1 semana`
        : "Para empezar, ~1 semana",
      products: optionBData.products,
      totalPrice: optionBData.totalPrice,
      durationDays: optionBData.durationDays,
    },
    reasoning,
  };
  
  // If NO allergy, generate beef (premium) alternatives for toggle
  if (!hasAllergy) {
    const optionAAltData = calculateOptionA(dailyGrams, products, "beef");
    const optionBAltData = calculateOptionB(dailyGrams, products, "beef");
    
    result.optionA_alt = {
      title: "Porción Quincenal",
      subtitle: "BARF Res Premium - ~2 semanas",
      products: optionAAltData.products,
      totalPrice: optionAAltData.totalPrice,
      badge: "✨ Premium",
      isRecommended: true,
      durationDays: optionAAltData.durationDays,
    };
    
    result.optionB_alt = {
      title: "Porción Semanal",
      subtitle: "BARF Res Premium - ~1 semana",
      products: optionBAltData.products,
      totalPrice: optionBAltData.totalPrice,
      durationDays: optionBAltData.durationDays,
    };
  }
  
  return result;
}
