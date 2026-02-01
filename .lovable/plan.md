

# Plan: Unificar el Flujo del AI Recommender

## Objetivo

Unificar ambos flujos (Guest y Profile) para que sigan el mismo patrón del Profile Flow, pero **sin la opción de foto**. Esto significa:

1. **Cumpleaños**: Usar `BirthdayPicker` (selector con dropdowns) en lugar de QuickReplies
2. **Peso**: Crear un nuevo `WeightPicker` (selector similar al BirthdayPicker) en lugar de QuickReplies
3. **Sin foto**: Eliminar el paso de imagen del flujo unificado
4. **Preguntas consistentes**: Unificar todos los mensajes entre ambos flujos

---

## Flujo Actual vs Flujo Unificado

| Paso | Guest Flow (Actual) | Profile Flow (Actual) | Flujo Unificado |
|------|---------------------|----------------------|-----------------|
| Nombre | ChatInput ✓ | ChatInput ✓ | ChatInput |
| Cumpleaños | QuickReplies (Cachorro/Adulto/Senior) | BirthdayPicker | **BirthdayPicker** |
| Peso | QuickReplies (0-5kg, 5-15kg...) | ChatInput (texto libre) | **WeightPicker** (nuevo) |
| Actividad | QuickReplies | QuickReplies | QuickReplies |
| Condición | QuickReplies | QuickReplies | QuickReplies |
| Alergias | QuickReplies | QuickReplies | QuickReplies |
| Objetivo | QuickReplies | No existe | **QuickReplies** (añadir a profile) |
| Foto | No existe | ImageUploadStep | **Eliminar** |

---

## Cambios a Implementar

### 1. Crear Componente `WeightPicker`

Nuevo componente similar a `BirthdayPicker` con un slider o selector de peso:

```
WeightPicker
├── Slider de 1-80 kg
├── Input numérico para ajuste fino
└── Botón "Confirmar"
```

### 2. Modificar Guest Flow

| Paso | Antes | Después |
|------|-------|---------|
| `weight` | QuickReplies | **WeightPicker** |
| `age` | QuickReplies (Cachorro/Adulto/Senior) | **BirthdayPicker** → calcular edad |

### 3. Modificar Profile Flow

| Paso | Antes | Después |
|------|-------|---------|
| `profile_weight` | ChatInput | **WeightPicker** |
| `profile_allergies` → siguiente | profile_image | **profile_goal** |
| `profile_goal` | No existe | **QuickReplies** (objetivo) |
| `profile_image` | ImageUploadStep | **Eliminar** |

### 4. Eliminar el Paso de Foto

- Después de alergias, ir directo a objetivo
- Después de objetivo, guardar perfil y mostrar resultado
- Eliminar `profile_image` del flujo

---

## Sección Técnica

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/ai/WeightPicker.tsx` | Selector de peso con slider/input |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/ai/index.ts` | Exportar WeightPicker |
| `src/pages/AIRecomendador.tsx` | Unificar flujos, eliminar foto, añadir profile_goal |

---

### WeightPicker.tsx (Nuevo)

```typescript
interface WeightPickerProps {
  onSubmit: (weight: number) => void;
  disabled?: boolean;
  initialValue?: number;
}

// Componente con:
// - Slider de 1-80 kg
// - Display del valor actual
// - Botón "Confirmar"
```

### AIRecomendador.tsx - Cambios en Steps

**Agregar nuevo step:**
```typescript
type Step = 
  | ...
  | "profile_goal"  // NUEVO
  // Eliminar: | "profile_image"
```

**Agregar handler `handleProfileGoalSelect`:**
```typescript
const handleProfileGoalSelect = async (value: string, label: string) => {
  if (isProcessing) return;
  setIsProcessing(true);
  addMessage(label, false);
  
  const nextDraft = { ...profileDraft };
  
  try {
    const saved = await upsertDogProfileFromDraft(nextDraft, value);
    await addBotMessage(`¡Listo! Perfil de ${saved.name} guardado. ✅`);
    setEditingDogId(null);
    setStep("profile_done");
  } catch (error: any) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  } finally {
    setIsProcessing(false);
  }
};
```

**Modificar `handleProfileAllergySelect`:**
```typescript
// ANTES: Ir a profile_image
// DESPUÉS: Ir a profile_goal
await addBotMessage(`¡Okay! Última pregunta: ¿Cuál es tu objetivo con la dieta BARF para ${profileDraft.name}? 🎯`);
setStep("profile_goal");
```

**Modificar Guest Flow handlers:**
```typescript
// handleWeightSelect → handleWeightSubmit (usar WeightPicker)
const handleWeightSubmit = (weight: number) => {
  setPetData(prev => ({ ...prev, weight }));
  addMessage(`${weight} kg`, false);
  // Ir a birthday picker
  await addBotMessage(`¿Cuándo nació ${petData.name}? 🎂`);
  setStep("birthday");  // NUEVO: reemplaza "age"
};

// handleAgeSelect → handleBirthdaySubmit
const handleBirthdaySubmit = (date: string) => {
  const ageStage = getAgeStageFromBirthday(date);
  setPetData(prev => ({ ...prev, age: ageStage, birthday: date }));
  // Continuar con actividad...
};
```

**Cambios en renderInputSection:**
```typescript
case "weight":
  return <WeightPicker onSubmit={handleWeightSubmit} disabled={isProcessing} />;

case "birthday":  // Antes era "age"
  return <BirthdayPicker onSubmit={handleBirthdaySubmit} disabled={isProcessing} />;

case "profile_weight":
  return <WeightPicker onSubmit={handleProfileWeightSubmit} disabled={isProcessing} />;

case "profile_goal":
  return <QuickReplies options={goalOptions} onSelect={handleProfileGoalSelect} columns={3} disabled={isProcessing} />;

// ELIMINAR case "profile_image"
```

---

## Flujo Final Unificado

```
1. Nombre (ChatInput)
   ↓
2. Cumpleaños (BirthdayPicker) → calcula edad automáticamente
   ↓
3. Peso (WeightPicker)
   ↓
4. Actividad (QuickReplies: Tranquilo/Normal/Activo)
   ↓
5. Condición corporal (QuickReplies: Flaco/Ideal/Gordito)
   ↓
6. Alergias (QuickReplies: Pollo/Res/Ninguna)
   ↓
7. Objetivo (QuickReplies: Probar/Rutina/Variedad)
   ↓
→ Resultado (sin paso de foto)
```

Este flujo será idéntico tanto para usuarios guest como para usuarios registrados creando un nuevo perfil.

---

## Mensajes Unificados

| Transición | Mensaje |
|------------|---------|
| Nombre → Cumpleaños | `¡Encantado de conocer a ${name}! 🐾 ¿Cuándo nació?` |
| Cumpleaños → Peso | `Perfecto, anotado. ¿Cuánto pesa ${name}? ⚖️` |
| Peso → Actividad | `Muy bien. ¿Qué tan activo es ${name}? 🏃` |
| Actividad → Condición | `¿Cómo describirías la condición corporal de ${name}? ⚖️` |
| Condición → Alergias | `Entendido. ¿${name} tiene alergias conocidas? 🤧` |
| Alergias → Objetivo | `¡Okay! Última pregunta: ¿Cuál es tu objetivo con la dieta BARF para ${name}? 🎯` |

