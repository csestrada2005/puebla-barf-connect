/**
 * Plan Calculator Hook - New Plan Builder Logic
 * 
 * Packaging != Portion: 500g vs 1kg is just packaging preference
 * Users buy 7-Day or 15-Day Plans
 * Subscription is optional (Basic/Pro tiers)
 */

export interface DogProfile {
  id: string;
  name: string;
  daily_grams: number;
  weight_kg: number;
  age_stage: string;
  recommended_protein: string;
  birthday?: string | null;
  status?: string;
}

export interface PlanDuration {
  days: 7 | 15;
  label: string;
  description: string;
}

export interface PackagingOption {
  size: '500g' | '1kg';
  label: string;
  description: string;
}

export interface BagBreakdown {
  size: '500g' | '1kg';
  quantity: number;
  gramsPerBag: number;
}

export interface PlanCalculation {
  totalKg: number;
  totalGrams: number;
  bags: BagBreakdown[];
  totalBags: number;
  pricePerKg: number;
  subtotal: number;
  durationDays: number;
}

export interface SubscriptionTier {
  type: 'basic' | 'pro';
  label: string;
  discountPercent: number;
  benefits: string[];
  priceAfterDiscount: number;
}

// Constants
const PRICE_PER_KG = 150; // $150 MXN per kg

export const PLAN_DURATIONS: PlanDuration[] = [
  { days: 7, label: 'Plan 7 Días', description: 'Una semana de alimento' },
  { days: 15, label: 'Plan 15 Días', description: 'Dos semanas de alimento' },
];

export const PACKAGING_OPTIONS: PackagingOption[] = [
  { size: '500g', label: '500g', description: 'Más paquetes, más práctico' },
  { size: '1kg', label: '1kg', description: 'Menos paquetes, mejor precio' },
];

/**
 * Calculate total kg needed for a given duration
 */
export function calculateTotalKg(dailyGrams: number, days: 7 | 15): number {
  const totalGrams = dailyGrams * days;
  return totalGrams / 1000;
}

/**
 * Calculate bag breakdown based on packaging preference
 * Allows mixed bags to hit target weight
 */
export function calculateBagBreakdown(
  totalKg: number,
  preferredSize: '500g' | '1kg'
): BagBreakdown[] {
  const totalGrams = totalKg * 1000;
  const bags: BagBreakdown[] = [];
  
  if (preferredSize === '1kg') {
    // Prefer 1kg bags, use 500g for remainder
    const full1kgBags = Math.floor(totalGrams / 1000);
    const remainderGrams = totalGrams % 1000;
    
    if (full1kgBags > 0) {
      bags.push({ size: '1kg', quantity: full1kgBags, gramsPerBag: 1000 });
    }
    
    if (remainderGrams > 0) {
      // Round up: any remainder needs a 500g bag
      const halfBags = Math.ceil(remainderGrams / 500);
      bags.push({ size: '500g', quantity: halfBags, gramsPerBag: 500 });
    }
  } else {
    // All 500g bags
    const totalBags = Math.ceil(totalGrams / 500);
    bags.push({ size: '500g', quantity: totalBags, gramsPerBag: 500 });
  }
  
  return bags;
}

/**
 * Calculate full plan details
 */
export function calculatePlan(
  dailyGrams: number,
  durationDays: 7 | 15,
  packagingSize: '500g' | '1kg'
): PlanCalculation {
  const totalKg = calculateTotalKg(dailyGrams, durationDays);
  const totalGrams = dailyGrams * durationDays;
  const bags = calculateBagBreakdown(totalKg, packagingSize);
  
  // Calculate actual grams from bags (may be slightly more due to rounding)
  const actualGrams = bags.reduce((sum, bag) => sum + (bag.quantity * bag.gramsPerBag), 0);
  const actualKg = actualGrams / 1000;
  
  const totalBags = bags.reduce((sum, bag) => sum + bag.quantity, 0);
  const subtotal = Math.round(actualKg * PRICE_PER_KG);
  
  return {
    totalKg: actualKg,
    totalGrams: actualGrams,
    bags,
    totalBags,
    pricePerKg: PRICE_PER_KG,
    subtotal,
    durationDays,
  };
}

/**
 * Get subscription tier details
 */
export function getSubscriptionTiers(basePrice: number): SubscriptionTier[] {
  return [
    {
      type: 'basic',
      label: 'Básico',
      discountPercent: 5,
      benefits: [
        'Entrega automática',
        'Sin compromiso',
        'Cancela cuando quieras',
      ],
      priceAfterDiscount: Math.round(basePrice * 0.95),
    },
    {
      type: 'pro',
      label: 'Pro',
      discountPercent: 15,
      benefits: [
        'Entrega automática',
        '15% de descuento',
        'Prioridad en entregas',
        'Acceso a recetas exclusivas',
        'Soporte prioritario',
      ],
      priceAfterDiscount: Math.round(basePrice * 0.85),
    },
  ];
}

/**
 * Check if today is the dog's birthday (ignoring year)
 */
export function isBirthday(birthday: string | null | undefined): boolean {
  if (!birthday) return false;
  
  const today = new Date();
  const birthDate = new Date(birthday);
  
  return (
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate()
  );
}

/**
 * Format dog age from birthday
 */
export function calculateAge(birthday: string | null | undefined): string | null {
  if (!birthday) return null;
  
  const today = new Date();
  const birthDate = new Date(birthday);
  
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  
  if (years < 1) {
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + monthDiff;
    return months <= 1 ? '1 mes' : `${months} meses`;
  }
  
  return years === 1 ? '1 año' : `${years} años`;
}
