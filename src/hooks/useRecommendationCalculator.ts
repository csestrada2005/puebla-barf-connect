// Types for the enhanced recommendation system
export interface PetData {
  name: string;
  weight: number;
  age: string; // puppy, adult, senior
  activity: string; // low, normal, high
  bodyCondition: string; // underweight, ideal, overweight
  sensitivity: string; // high, medium, low
  goal: string; // trial, routine, variety
  allergy?: "chicken" | "beef" | "none"; // NEW: allergy filter
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
 * Calculate the base percentage based on age stage
 * Puppy: 6%, Adult: 2.5%, Senior: 2.0%
 */
function getBasePercentage(age: string): number {
  switch (age) {
    case "puppy": return 6.0;
    case "senior": return 2.0;
    case "adult":
    default: return 2.5;
  }
}

/**
 * Calculate activity adjustment
 * Low: -0.5%, Normal: 0%, High: +0.5%
 */
function getActivityAdjustment(activity: string): number {
  switch (activity) {
    case "low": return -0.5;
    case "high": return 0.5;
    case "normal":
    default: return 0;
  }
}

/**
 * Calculate body condition adjustment
 * Underweight: +0.5%, Ideal: 0%, Overweight: -0.5%
 */
function getConditionAdjustment(bodyCondition: string): number {
  switch (bodyCondition) {
    case "underweight": return 0.5;
    case "overweight": return -0.5;
    case "ideal":
    default: return 0;
  }
}

/**
 * Calculate daily grams using the formula:
 * Final % = Base + Activity Adjustment + Condition Adjustment
 * Grams/Day = Weight * (Final % / 100) * 1000
 */
export function calculateDailyGrams(
  weight: number, 
  age: string, 
  activity: string, 
  bodyCondition: string
): number {
  const basePercent = getBasePercentage(age);
  const activityAdj = getActivityAdjustment(activity);
  const conditionAdj = getConditionAdjustment(bodyCondition);
  
  const finalPercent = basePercent + activityAdj + conditionAdj;
  const dailyGrams = weight * (finalPercent / 100) * 1000;
  
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
  // Calculate daily grams with new formula
  const dailyGrams = calculateDailyGrams(
    petData.weight, 
    petData.age, 
    petData.activity, 
    petData.bodyCondition
  );
  
  const weeklyKg = (dailyGrams * 7) / 1000;
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
  
  // Calculate cart options with the recommended protein
  const optionAData = calculateOptionA(dailyGrams, products, recommendedProtein);
  const optionBData = calculateOptionB(dailyGrams, products, recommendedProtein);
  
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
  
  // If NO allergy, also calculate alternative protein options (for toggle)
  // Primary = recommended (usually chicken/económico), Alt = beef (premium)
  if (!hasAllergy) {
    // Calculate alternative options with the "other" protein
    const altProtein: "chicken" | "beef" = recommendedProtein === "chicken" ? "beef" : "chicken";
    const optionAAltData = calculateOptionA(dailyGrams, products, altProtein);
    const optionBAltData = calculateOptionB(dailyGrams, products, altProtein);
    
    result.optionA_alt = {
      title: "Porción Quincenal",
      subtitle: `BARF ${altProtein === "beef" ? "Res Premium" : "Pollo"} - ~2 semanas`,
      products: optionAAltData.products,
      totalPrice: optionAAltData.totalPrice,
      badge: altProtein === "beef" ? "✨ Premium" : undefined,
      isRecommended: altProtein === "beef",
      durationDays: optionAAltData.durationDays,
    };
    
    result.optionB_alt = {
      title: "Porción Semanal",
      subtitle: `BARF ${altProtein === "beef" ? "Res Premium" : "Pollo"} - ~1 semana`,
      products: optionBAltData.products,
      totalPrice: optionBAltData.totalPrice,
      durationDays: optionBAltData.durationDays,
    };
  }
  
  return result;
}
