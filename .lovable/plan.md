
# Plan: Hacer los Elementos del Hero Mas Grandes

## Resumen

Voy a aumentar el tamano de todos los elementos principales del hero para que sean mas prominentes y cubran mas espacio visual.

---

## Cambios Especificos

### 1. Badge "Nutricion calculada con IA"
- **Actual:** `px-3 py-1.5`, icono `h-4 w-4`, texto `text-sm`
- **Nuevo:** `px-5 py-2.5`, icono `h-5 w-5`, texto `text-base md:text-lg`

### 2. Tagline Principal
- **Actual:** `text-xl sm:text-2xl md:text-3xl lg:text-4xl`
- **Nuevo:** `text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl`
- Aumentar el `max-w` del contenedor para dar mas espacio

### 3. Boton "Iniciar" (Primario)
- **Actual:** `size="lg"`, `px-6 py-5`, icono `h-5 w-5`
- **Nuevo:** `px-10 py-7`, texto `text-lg md:text-xl`, icono `h-6 w-6`

### 4. Boton "Explorar productos" (Secundario)
- **Actual:** `size="lg"`, icono `h-4 w-4`
- **Nuevo:** texto `text-lg`, icono `h-5 w-5`

### 5. Boton "Iniciar Sesion"
- **Actual:** `size="sm"`, icono `h-4 w-4`
- **Nuevo:** `size="default"`, icono `h-5 w-5`, texto mas grande

### 6. Espaciado General
- Aumentar el `mb` (margin-bottom) entre elementos
- Dar mas espacio al tagline con `mb-6` en lugar de `mb-4`

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Aumentar tamanos de texto, padding, iconos y espaciado en la seccion hero |

---

## Resultado Visual Esperado

El hero tendra elementos mas grandes y prominentes, haciendo que el contenido principal sea mas impactante y ocupe mas del viewport, especialmente en dispositivos moviles y tablets.
