

# Eliminar la pagina de Suscripcion

## Resumen
Se eliminara la pagina `/suscripcion` y todas las referencias a ella en navegacion, rutas y enlaces del proyecto.

## Cambios planificados

### 1. Eliminar archivo principal
- **Eliminar** `src/pages/Suscripcion.tsx`

### 2. Actualizar rutas (`src/App.tsx`)
- Quitar el `lazy import` de `Suscripcion`
- Quitar la `<Route path="/suscripcion" ...>` del router

### 3. Actualizar Header (`src/components/layout/Header.tsx`)
- Quitar `prefetchSuscripcion` y su referencia
- Quitar `{ href: "/suscripcion", label: "Suscripcion" }` de `navLinksLeft`

### 4. Actualizar Footer (`src/components/layout/Footer.tsx`)
- Quitar el `<Link to="/suscripcion">` de la navegacion del footer

### 5. Actualizar DualRecommendation (`src/components/ai/DualRecommendation.tsx`)
- Quitar o redirigir el boton que navega a `/suscripcion` (redirigir a `/tienda` como alternativa)

### 6. Actualizar MiCuenta (`src/pages/MiCuenta.tsx`)
- Quitar el boton "Modificar" que enlaza a `/suscripcion` en la seccion de suscripciones del usuario

## Archivos que NO se modifican
- `src/pages/Terminos.tsx` y `src/pages/Cobertura.tsx`: solo mencionan "suscripcion" como concepto general, no enlazan a la pagina
- `src/components/admin/*`: la gestion de suscripciones en el admin sigue siendo relevante para suscripciones existentes
- `src/components/ai/SubscriptionTiers.tsx`: este componente vive en el flujo del Recomendador AI y es independiente de la pagina `/suscripcion`

## Seccion tecnica
- 1 archivo eliminado, 5 archivos editados
- Sin cambios en base de datos ni backend
- La tabla `subscriptions` y la logica del carrito para suscripciones se mantienen intactas (se siguen creando desde el Recomendador AI)
