// Types for the enhanced recommendation system
export interface PetData {
  name: string;
  weight: number;
  age: string; // puppy, adult, senior
  activity: string; // low, normal, high
  bodyCondition: string; // underweight, ideal, overweight
  sensitivity: string; // high, medium, low
  goal: string; // trial, routine, variety
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
  optionA: RecommendationOption;
  optionB: RecommendationOption;
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
 * Calculate Option A (Best Value): Prefers 1kg packs + 14 days (Quincenal)
 * Uses Math.floor for 1kg packs, Math.ceil for 500g remainder
 */
function calculateOptionA(
  dailyGrams: number,
  products: Product[],
  protein: "chicken" | "beef" | "mix"
): { products: ProductOption[]; totalPrice: number; durationDays: number } {
  const targetDays = 14;
  const totalGrams = dailyGrams * targetDays;
  
  const optionProducts: ProductOption[] = [];
  let totalPrice = 0;
  let actualGrams = 0;
  
  if (protein === "mix") {
    // Split between chicken and beef
    const halfGrams = totalGrams / 2;
    
    // Chicken portion
    const pollo1kg = products.find(p => p.protein_line === "pollo" && p.presentation === "1kg");
    const pollo500 = products.find(p => p.protein_line === "pollo" && p.presentation === "500g");
    
    if (pollo1kg) {
      const packs1kg = Math.floor(halfGrams / 1000);
      const remainder = halfGrams % 1000;
      
      if (packs1kg > 0) {
        optionProducts.push({
          id: pollo1kg.id,
          slug: pollo1kg.slug,
          name: pollo1kg.name,
          price: Number(pollo1kg.price),
          quantity: packs1kg,
          presentation: "1kg",
        });
        totalPrice += Number(pollo1kg.price) * packs1kg;
        actualGrams += packs1kg * 1000;
      }
      
      if (remainder > 0 && pollo500) {
        const packs500 = Math.ceil(remainder / 500);
        optionProducts.push({
          id: pollo500.id,
          slug: pollo500.slug,
          name: pollo500.name,
          price: Number(pollo500.price),
          quantity: packs500,
          presentation: "500g",
        });
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
        optionProducts.push({
          id: res1kg.id,
          slug: res1kg.slug,
          name: res1kg.name,
          price: Number(res1kg.price),
          quantity: packs1kg,
          presentation: "1kg",
        });
        totalPrice += Number(res1kg.price) * packs1kg;
        actualGrams += packs1kg * 1000;
      }
      
      if (remainder > 0 && res500) {
        const packs500 = Math.ceil(remainder / 500);
        optionProducts.push({
          id: res500.id,
          slug: res500.slug,
          name: res500.name,
          price: Number(res500.price),
          quantity: packs500,
          presentation: "500g",
        });
        totalPrice += Number(res500.price) * packs500;
        actualGrams += packs500 * 500;
      }
    }
  } else {
    // Single protein type
    const proteinLine = protein === "chicken" ? "pollo" : "res";
    const product1kg = products.find(p => p.protein_line === proteinLine && p.presentation === "1kg");
    const product500 = products.find(p => p.protein_line === proteinLine && p.presentation === "500g");
    
    if (product1kg) {
      const packs1kg = Math.floor(totalGrams / 1000);
      const remainder = totalGrams % 1000;
      
      if (packs1kg > 0) {
        optionProducts.push({
          id: product1kg.id,
          slug: product1kg.slug,
          name: product1kg.name,
          price: Number(product1kg.price),
          quantity: packs1kg,
          presentation: "1kg",
        });
        totalPrice += Number(product1kg.price) * packs1kg;
        actualGrams += packs1kg * 1000;
      }
      
      if (remainder > 0 && product500) {
        const packs500 = Math.ceil(remainder / 500);
        optionProducts.push({
          id: product500.id,
          slug: product500.slug,
          name: product500.name,
          price: Number(product500.price),
          quantity: packs500,
          presentation: "500g",
        });
        totalPrice += Number(product500.price) * packs500;
        actualGrams += packs500 * 500;
      }
    }
  }
  
  const durationDays = actualGrams > 0 ? Math.floor(actualGrams / dailyGrams) : targetDays;
  
  return { products: optionProducts, totalPrice, durationDays };
}

/**
 * Calculate Option B (Low Investment): Prefers 500g packs + 7 days (Semanal)
 */
function calculateOptionB(
  dailyGrams: number,
  products: Product[],
  protein: "chicken" | "beef" | "mix"
): { products: ProductOption[]; totalPrice: number; durationDays: number } {
  const targetDays = 7;
  const totalGrams = dailyGrams * targetDays;
  
  const optionProducts: ProductOption[] = [];
  let totalPrice = 0;
  let actualGrams = 0;
  
  if (protein === "mix") {
    // Split between chicken and beef
    const halfGrams = totalGrams / 2;
    
    const pollo500 = products.find(p => p.protein_line === "pollo" && p.presentation === "500g");
    const res500 = products.find(p => p.protein_line === "res" && p.presentation === "500g");
    
    if (pollo500) {
      const packs = Math.ceil(halfGrams / 500);
      optionProducts.push({
        id: pollo500.id,
        slug: pollo500.slug,
        name: pollo500.name,
        price: Number(pollo500.price),
        quantity: packs,
        presentation: "500g",
      });
      totalPrice += Number(pollo500.price) * packs;
      actualGrams += packs * 500;
    }
    
    if (res500) {
      const packs = Math.ceil(halfGrams / 500);
      optionProducts.push({
        id: res500.id,
        slug: res500.slug,
        name: res500.name,
        price: Number(res500.price),
        quantity: packs,
        presentation: "500g",
      });
      totalPrice += Number(res500.price) * packs;
      actualGrams += packs * 500;
    }
  } else {
    const proteinLine = protein === "chicken" ? "pollo" : "res";
    const product500 = products.find(p => p.protein_line === proteinLine && p.presentation === "500g");
    
    if (product500) {
      const packs = Math.ceil(totalGrams / 500);
      optionProducts.push({
        id: product500.id,
        slug: product500.slug,
        name: product500.name,
        price: Number(product500.price),
        quantity: packs,
        presentation: "500g",
      });
      totalPrice += Number(product500.price) * packs;
      actualGrams += packs * 500;
    }
  }
  
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
  
  const recommendedProtein = determineProtein(
    petData.sensitivity,
    petData.bodyCondition,
    petData.activity,
    planType
  );
  
  // Calculate cart options
  const optionAData = calculateOptionA(dailyGrams, products, recommendedProtein);
  const optionBData = calculateOptionB(dailyGrams, products, recommendedProtein);
  
  // Generate reasoning
  const reasoning = generateReasoning(petData, planType, recommendedProtein, dailyGrams);
  
  return {
    dailyGrams,
    weeklyKg,
    monthlyKg,
    planType,
    recommendedProtein,
    optionA: {
      title: "Opción A: Mejor Valor",
      subtitle: "Más práctico, mejor precio por kg, ~2 semanas",
      products: optionAData.products,
      totalPrice: optionAData.totalPrice,
      badge: "✨ Recomendado",
      isRecommended: true,
      durationDays: optionAData.durationDays,
    },
    optionB: {
      title: "Opción B: Para Empezar",
      subtitle: "Menor inversión inicial, ~1 semana",
      products: optionBData.products,
      totalPrice: optionBData.totalPrice,
      durationDays: optionBData.durationDays,
    },
    reasoning,
  };
}
