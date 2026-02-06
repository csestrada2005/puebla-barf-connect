
# Plan: Otorgar acceso de Admin a csestrada2005@outlook.com

## Resumen
Actualizar el campo `is_admin` a `true` para el usuario con correo `csestrada2005@outlook.com` en la tabla `profiles`.

## Pasos

### 1. Ejecutar migración SQL
Actualizar el registro existente en la base de datos:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'csestrada2005@outlook.com';
```

**Resultado esperado**: El usuario podrá acceder a `/admin` después de iniciar sesión.

---

## Cómo funciona el sistema de Admin (explicación detallada)

### Flujo de autenticación
1. Usuario inicia sesión en `/login`
2. El hook `useAuth` detecta la sesión y guarda el estado
3. Al navegar a `/admin`:
   - Se verifica si está autenticado
   - Se carga su perfil con `useProfile`
   - Se verifica si `profile.is_admin === true`

### Estructura de seguridad

```text
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
├─────────────────────────────────────────────────────────┤
│  Admin.tsx                                              │
│  ├── Verifica isAuthenticated (hook useAuth)            │
│  ├── Carga perfil con useProfile                        │
│  └── Verifica profile?.is_admin === true                │
│       ├── SI: Muestra panel admin                       │
│       └── NO: Muestra "Acceso Denegado"                 │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Base de datos)              │
├─────────────────────────────────────────────────────────┤
│  Función is_admin()                                     │
│  ├── Verifica si auth.uid() tiene is_admin=true        │
│  └── Usada en todas las políticas RLS de admin         │
├─────────────────────────────────────────────────────────┤
│  Políticas RLS en profiles:                             │
│  ├── "Users can view their own profile" → auth.uid()=id│
│  ├── "Admins can view all profiles" → is_admin()       │
│  ├── "Users can update their own profile"→ auth.uid()=id│
│  └── "Admins can update all profiles" → is_admin()     │
└─────────────────────────────────────────────────────────┘
```

### Qué puede hacer un Admin
| Sección | Funcionalidad |
|---------|---------------|
| Dashboard | Ver métricas de ventas, clientes, suscripciones |
| Pedidos | Ver/editar todos los pedidos, enviar a chofer por WhatsApp |
| Clientes | Ver todos los perfiles de clientes |
| Suscripciones | Ver todas las suscripciones activas |
| Perritos | Ver todos los perfiles de mascotas |
| Configuración | Cambiar ajustes de la app |

### Tablas protegidas por RLS
- `profiles` - Solo admin puede ver todos, usuarios solo el suyo
- `orders` - Solo admin puede ver/modificar
- `subscriptions` - Solo admin puede ver todos
- `dog_profiles` - Solo admin puede ver todos
- `app_config` - Solo admin puede leer/modificar

---

## Notas técnicas

### Seguridad actual
- La columna `is_admin` está protegida por RLS
- Solo un admin existente puede cambiar `is_admin` de otros usuarios
- La función `is_admin()` usa `SECURITY DEFINER` para evitar recursión en RLS

### Recomendación futura (opcional)
Para mayor seguridad, se podría migrar a un sistema de roles separado (`user_roles` table) en el futuro, aunque el sistema actual funciona correctamente.
