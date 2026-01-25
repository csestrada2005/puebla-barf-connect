import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Dog, Phone, MapPin, Mail } from "lucide-react";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    pet_name: "",
    family_name: "",
    phone: "",
    address: "",
    postal_code: "",
    colonia: "",
    references_notes: "",
    special_notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuthContext();
  const { createProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up the user
      const { error: signUpError } = await signUp(formData.email, formData.password);
      
      if (signUpError) {
        toast({
          title: "Error al registrarse",
          description: signUpError.message,
          variant: "destructive",
        });
        return;
      }

      // 2. Sign in immediately (auto-confirm is enabled)
      const { error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        toast({
          title: "Cuenta creada",
          description: "Tu cuenta fue creada. Por favor inicia sesión.",
        });
        navigate("/login");
        return;
      }

      // 3. Create the profile
      await createProfile.mutateAsync({
        pet_name: formData.pet_name,
        family_name: formData.family_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        postal_code: formData.postal_code,
        colonia: formData.colonia || undefined,
        references_notes: formData.references_notes || undefined,
        special_notes: formData.special_notes || undefined,
      });

      // 4. Send welcome email via edge function (fire and forget)
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            petName: formData.pet_name,
            familyName: formData.family_name,
          }),
        });
      } catch (emailError) {
        console.log('Welcome email could not be sent:', emailError);
        // Don't block registration if email fails
      }

      toast({
        title: "¡Bienvenido a Raw Paw!",
        description: `Hola familia ${formData.family_name}, ¡${formData.pet_name} está listo para comer sano!`,
      });

      navigate("/tienda");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear tu cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <span className="text-2xl">🐾</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>
          Únete a la familia Raw Paw y dale a tu mejor amigo la mejor alimentación
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Account Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Datos de la cuenta
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Pet & Family Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Dog className="h-5 w-5 text-primary" />
              Tu mejor amigo
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet_name">Nombre de la mascota *</Label>
                <Input
                  id="pet_name"
                  name="pet_name"
                  type="text"
                  placeholder="Ej: Max, Luna, Rocky..."
                  value={formData.pet_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family_name">Apellido de la familia *</Label>
                <Input
                  id="family_name"
                  name="family_name"
                  type="text"
                  placeholder="Ej: García, López..."
                  value={formData.family_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contacto
            </h3>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono WhatsApp *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Ej: 221 123 4567"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Dirección de entrega
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección completa *</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Calle, número, interior..."
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  name="colonia"
                  type="text"
                  placeholder="Nombre de la colonia"
                  value={formData.colonia}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal *</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  type="text"
                  placeholder="72000"
                  value={formData.postal_code}
                  onChange={handleChange}
                  required
                  maxLength={5}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="references_notes">Referencias (opcional)</Label>
              <Input
                id="references_notes"
                name="references_notes"
                type="text"
                placeholder="Ej: Casa azul, frente al parque..."
                value={formData.references_notes}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_notes">Notas especiales (opcional)</Label>
              <Textarea
                id="special_notes"
                name="special_notes"
                placeholder="Alergias, preferencias de entrega, etc."
                value={formData.special_notes}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full gap-2" disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Crear Cuenta
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
