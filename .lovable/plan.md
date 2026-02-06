
# Plan: Refactorizar "Asi de facil funciona" y agregar seccion en Nosotros

## Resumen

Se realizaran dos cambios principales:
1. **Refactorizar la seccion "Asi de facil funciona"** en Home para usar tarjetas con imagenes de fondo de tamanio uniforme, con el numero del paso en la parte inferior de la imagen (similar al screenshot de referencia de "The Pets Table")
2. **Agregar nueva seccion** al final de la pagina Nosotros con el mensaje "Porque son un miembro mas de la familia"

---

## Cambio 1: Seccion "Asi de facil funciona"

### Diseno Visual (basado en referencia)
- **Tarjetas con imagen de fondo**: Cada tarjeta tendra una imagen grande con bordes redondeados en la parte superior
- **Badge de numero**: Circulo con el numero del paso posicionado en la parte inferior-centro de la imagen (solapando entre imagen y texto)
- **Altura uniforme**: Todas las tarjetas tendran el mismo tamanio usando `aspect-ratio` o altura fija
- **Texto debajo**: Titulo y descripcion debajo de la imagen

### Imagenes a utilizar
Las 3 fotos de perros con producto Raw Paw subidas por el usuario:
- `Gemini_Generated_Image_g6wkq5g6wkq5g6wk.png` - Cachorro Golden con producto (Paso 1)
- `DSC07256.jpg` - Pastor Aleman con producto (Paso 2) 
- `IMG_2693.jpg` - Dachshund en cama con producto (Paso 3)

### Estructura del componente

```text
+---------------------------+
|                           |
|     [IMAGEN GRANDE]       |
|     aspect-ratio 4:3      |
|     rounded-3xl           |
|                           |
|          (1)              |  <- Badge centrado en la parte inferior
+---------------------------+
        Titulo
      Descripcion
```

---

## Cambio 2: Nueva seccion en Nosotros

### Ubicacion
- Se agregara como **ultima seccion** de la pagina, justo antes del cierre del `<Layout>`
- Quedara despues del CTA actual ("Listo para cambiar su vida?")

### Diseno
- Fondo: `bg-secondary` (verde claro de la marca)
- Texto centrado: "Porque son un miembro mas de la familia"
- Tipografia grande y bold
- Imagen decorativa opcional: el grupo de perros (`Gemini_Generated_Image_whj3d3whj3d3whj3-removebg-preview.png`)

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Refactorizar seccion "howItWorks" con nuevo diseno de tarjetas |
| `src/pages/Nosotros.tsx` | Agregar nueva seccion al final |
| `src/assets/brand/` | Copiar las 3 imagenes de perros + imagen de grupo |

---

## Detalles tecnicos

### Home.tsx - Cambios principales

1. **Importar nuevas imagenes** en lugar de step-dog-1/2/3
2. **Actualizar array `howItWorks`** con las nuevas rutas de imagenes
3. **Refactorizar JSX** de las tarjetas:
   - Usar `AspectRatio` de Radix para mantener proporcion 4:3
   - Imagen como `object-cover` dentro del contenedor
   - Badge posicionado con `absolute bottom-0 left-1/2 translate-y-1/2`
   - Titulo y descripcion fuera de la tarjeta de imagen

4. **Mobile**: Mismo diseno pero en carrusel (ya existente)
5. **Desktop**: Grid de 3 columnas con altura uniforme

### Nosotros.tsx - Nueva seccion

```jsx
<section className="py-16 md:py-20 bg-secondary">
  <div className="container text-center">
    <motion.div {...fadeInUp}>
      <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground">
        Porque son un miembro mas de la familia
      </h2>
      {/* Imagen decorativa del grupo de perros */}
      <img src={familyDogs} className="mx-auto mt-8 max-w-md" />
    </motion.div>
  </div>
</section>
```

---

## Resultado esperado

### Home - "Asi de facil funciona"
- 3 tarjetas identicas en tamanio
- Imagenes reales de perros con producto Raw Paw
- Numero del paso como badge circular en la parte inferior de cada imagen
- Aspecto premium similar a "The Pets Table"

### Nosotros - Nueva seccion
- Seccion emotiva al final de la pagina
- Mensaje: "Porque son un miembro mas de la familia"
- Imagen de grupo de perros como refuerzo visual
