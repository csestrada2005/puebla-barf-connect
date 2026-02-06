
# Plan: Resolver todos los problemas de seguridad ✅ COMPLETADO

## Estado final

| Nivel | Problema | Estado |
|-------|----------|--------|
| ~~Error~~ | ~~Historial de estados de pedidos expuesto~~ | ✅ Resuelto |
| ~~Error~~ | ~~Fotos de entrega accesibles sin autenticación~~ | ✅ Resuelto |
| ~~Warn~~ | ~~Formulario de checkout sin validación~~ | ✅ Resuelto |
| ~~Warn~~ | ~~Email de bienvenida sin verificar propiedad~~ | ✅ Resuelto |
| Warn | Protección de contraseñas filtradas desactivada | ⚠️ Requiere config manual |
| ~~Info~~ | ~~Tokens de entrega revelan existencia de pedidos~~ | ✅ Ya protegido |
| ~~Info~~ | ~~Panel admin solo protegido en frontend~~ | ✅ RLS en backend |

---

## Cambios implementados

### Base de datos (Migraciones SQL)
- ✅ Eliminada política pública `Anyone can view order statuses by order`
- ✅ Agregada política `Admins can view all order statuses`
- ✅ Bucket `delivery-photos` ahora es privado
- ✅ Solo admins pueden ver/eliminar fotos de entrega
- ✅ Agregados CHECK constraints en tabla `orders`:
  - `customer_name`: 2-100 caracteres
  - `customer_phone`: formato válido 7-20 dígitos
  - `customer_address`: 10-500 caracteres
  - `delivery_notes`: máximo 1000 caracteres
- ✅ Política para admins ver waitlist

### Edge Functions
- ✅ **upload-delivery-photo**: Nueva función para subir fotos validando token
- ✅ **send-welcome-email**: Verifica que email coincida con perfil del usuario

### Frontend
- ✅ **Checkout.tsx**: Validación Zod + sanitización para WhatsApp
- ✅ **DeliveryPhotoUpload.tsx**: Usa nueva edge function con token

---

## Nota: Leaked Password Protection

La protección contra contraseñas filtradas se configura en el dashboard de Lovable Cloud > Auth Settings. No es configurable via código.
