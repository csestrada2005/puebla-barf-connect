
# Plan: Actualización de Paleta de Colores Oficial

## Resumen
Actualizar todos los colores del sistema de diseño para que coincidan exactamente con el brand book oficial de Raw Paw.

---

## Colores a Actualizar

### Paleta Oficial (del Brand Book)

| Nombre | HEX | HSL Correcto |
|--------|-----|--------------|
| **BARKY** (Verde principal) | #677755 | 87° 28% 46% |
| **LEAFY** (Verde claro) | #CAD8A3 | 74° 24% 84% |
| **SNOUT** (Fondo claro) | #ECEBE6 | 49° 2% 92% |
| **CHOCO** (Marrón oscuro) | #3F342B | 26° 31% 24% |

---

## Cambios Principales

### 1. Archivo `src/index.css`

Actualizar las variables CSS en `:root`:

**Colores base:**
- `--background`: 49 2% 92% (SNOUT)
- `--foreground`: 26 31% 24% (CHOCO)
- `--primary`: 87 28% 46% (BARKY)
- `--secondary`: 74 24% 84% (LEAFY)
- `--accent`: 74 24% 84% (LEAFY)

**Tokens de marca:**
- `--barky`: 87 28% 46%
- `--leafy`: 74 24% 84%
- `--snout`: 49 2% 92%
- `--choco`: 26 31% 24%

**Colores derivados (muted, borders, etc.):**
- Ajustar para mantener coherencia visual

### 2. Modo Oscuro (.dark)

Actualizar también las variables del tema oscuro para mantener consistencia con la nueva paleta.

---

## Archivos a Modificar

1. **`src/index.css`** - Variables CSS principales (light y dark mode)

---

## Resultado Esperado

- Todos los botones, fondos y acentos usarán los colores exactos del brand book
- El sitio tendrá una apariencia más fiel a la identidad visual oficial
- Sin cambios en la estructura o funcionalidad del código

---

## Siguiente Paso

Una vez aprobado este plan, implementaré los cambios. Después podrás enviarme:
- Los logos oficiales
- Los iconos/isotipos nuevos
- Cualquier otro asset visual
