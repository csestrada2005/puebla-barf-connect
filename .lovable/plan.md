

# Plan: Resolver todos los problemas de seguridad

## Resumen de problemas encontrados

El escaneo de seguridad encontró **6 problemas** en total:

| Nivel | Problema | Dificultad |
|-------|----------|------------|
| Error | Historial de estados de pedidos expuesto | Facil |
| Error | Fotos de entrega accesibles sin autenticacion | Media |
| Warn | Formulario de checkout sin validacion | Facil |
| Warn | Email de bienvenida sin verificar propiedad | Facil |
| Warn | Proteccion de contrasenas filtradas desactivada | Facil |
| Info | Tokens de entrega revelan existencia de pedidos | Media |
| Info | Panel admin solo protegido en frontend | Baja |

---

## Explicacion simple: Como funcionan los roles en tu sitio

### Que puede hacer un usuario normal (no admin)

```text
USUARIO NORMAL
├── Ver pagina principal y tienda
├── Crear cuenta y perfil
├── Hacer pedidos
├── Ver SUS propios pedidos
├── Ver SUS propios perros registrados
├── Modificar SU propio perfil
└── Cancelar SU propia suscripcion
```

### Que puede hacer un administrador

```text
ADMINISTRADOR (is_admin = true)
├── Todo lo que puede hacer un usuario normal
├── Ver TODOS los pedidos de todos los clientes
├── Editar/eliminar cualquier pedido
├── Ver TODOS los perfiles de clientes
├── Ver TODAS las suscripciones
├── Ver TODOS los perros registrados
├── Enviar notificaciones a choferes por WhatsApp
├── Configurar la aplicacion (choferes, ajustes)
└── Sincronizar datos con Google Sheets
```

### Como funciona la seguridad

1. **En el navegador (frontend)**: Cuando alguien va a `/admin`, el codigo verifica si `profile.is_admin === true`. Si no es admin, ve "Acceso Denegado".

2. **En la base de datos (backend)**: Hay una funcion `is_admin()` que verifica si el usuario actual es administrador. TODAS las tablas usan esta funcion en sus politicas de seguridad (RLS).

3. **En las funciones del servidor (edge functions)**: Antes de ejecutar acciones sensibles, verifican el token JWT y comprueban si el usuario es admin.

Aunque alguien intente saltarse la pantalla del navegador, la base de datos RECHAZARA cualquier operacion no autorizada.

---

## Plan de solucion

### Paso 1: Arreglar exposicion del historial de estados (ERROR)

**Problema**: Cualquiera puede ver los estados de los pedidos si conoce el ID.

**Solucion**:
- Eliminar la politica permisiva "Anyone can view order statuses by order"
- Mantener solo la politica que requiere autenticacion

```sql
DROP POLICY IF EXISTS "Anyone can view order statuses by order" ON public.order_statuses;
```

### Paso 2: Proteger el bucket de fotos de entrega (ERROR)

**Problema**: Las fotos de entrega son publicas - cualquiera puede ver las casas de tus clientes.

**Solucion**:
- Hacer el bucket privado
- Crear una funcion para subir fotos usando el token de entrega
- Solo admins y choferes autorizados pueden ver/subir fotos

```sql
-- Hacer el bucket privado
UPDATE storage.buckets SET public = false WHERE id = 'delivery-photos';

-- Eliminar politicas permisivas actuales
DROP POLICY IF EXISTS "Anyone can upload delivery photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view delivery photos" ON storage.objects;

-- Nueva politica: solo admins pueden ver fotos
CREATE POLICY "Admins can view delivery photos" ON storage.objects
FOR SELECT USING (bucket_id = 'delivery-photos' AND is_admin());

-- Nueva politica: solo admins pueden eliminar fotos
CREATE POLICY "Admins can delete delivery photos" ON storage.objects
FOR DELETE USING (bucket_id = 'delivery-photos' AND is_admin());
```

Ademas, crear un nuevo edge function para manejar las subidas de fotos con validacion de token.

### Paso 3: Agregar validacion al checkout (WARN)

**Problema**: El formulario de checkout no valida los datos antes de guardarlos.

**Solucion**:
- Agregar validacion con Zod en el cliente
- Agregar restricciones CHECK en la base de datos
- Sanitizar texto para mensajes de WhatsApp

```sql
ALTER TABLE orders
ADD CONSTRAINT check_customer_name_length CHECK (length(customer_name) <= 100),
ADD CONSTRAINT check_customer_phone_format CHECK (customer_phone ~ '^[0-9+ -]{7,20}$'),
ADD CONSTRAINT check_customer_address_length CHECK (length(customer_address) <= 500),
ADD CONSTRAINT check_delivery_notes_length CHECK (delivery_notes IS NULL OR length(delivery_notes) <= 1000);
```

En el frontend, agregar esquema de validacion:

```typescript
const checkoutSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[0-9+ -]{7,20}$/),
  address: z.string().min(10).max(500),
  notes: z.string().max(1000).optional(),
});
```

### Paso 4: Verificar propiedad del email en welcome email (WARN)

**Problema**: Un usuario autenticado puede enviar emails de bienvenida a cualquier direccion.

**Solucion**:
- Verificar que el email coincide con el perfil del usuario autenticado
- Agregar limite de 1 email por usuario

```typescript
// En send-welcome-email/index.ts
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const { data: profile } = await serviceClient
  .from("profiles")
  .select("email")
  .eq("id", userId)
  .single();

if (profile?.email !== email) {
  return new Response(
    JSON.stringify({ error: 'Email does not match user profile' }),
    { status: 403, headers: corsHeaders }
  );
}
```

### Paso 5: Habilitar proteccion de contrasenas filtradas (WARN)

**Problema**: La proteccion contra contrasenas que han sido expuestas en filtraciones esta desactivada.

**Solucion**:
Este ajuste se hace en la configuracion de autenticacion del proyecto (no requiere codigo). Se habilitara la opcion "Leaked Password Protection" en la configuracion de Auth.

### Paso 6: Mejoras menores de seguridad (INFO)

**Tokens de entrega**:
- Ya implementamos expiracion de 7 dias (correcto)
- Ya enmascaramos nombres y telefonos (correcto)
- Agregar mensajes genericos para tokens invalidos

**Panel admin**:
- Ya esta protegido por RLS en el backend (correcto)
- La UI solo es cosmética, no es una brecha de seguridad
- Opcionalmente agregar logging de intentos de acceso no autorizados

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Restricciones de la BD + politicas de storage |
| `src/pages/Checkout.tsx` | Validacion con Zod |
| `supabase/functions/send-welcome-email/index.ts` | Verificar propiedad del email |
| `supabase/functions/upload-delivery-photo/index.ts` | Nueva funcion para subir fotos con token |
| `src/components/driver/DeliveryPhotoUpload.tsx` | Usar nueva funcion en vez de subida directa |
| Configuracion Auth | Habilitar leaked password protection |

---

## Resumen de impacto

- **Usuarios normales**: No notaran ningun cambio en su experiencia
- **Administradores**: Seguiran teniendo acceso completo
- **Choferes**: Podran seguir subiendo fotos con su token de entrega
- **Seguridad**: Se cierran todas las brechas identificadas

