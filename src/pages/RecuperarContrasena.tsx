import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
// Recovery email is sent via custom edge function
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-recovery-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email,
            redirectTo: `${window.location.origin}/restablecer-contrasena`,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Ocurrió un error al enviar el correo",
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Correo enviado",
          description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Layout>
        <div className="container py-12">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">¡Correo enviado!</CardTitle>
              <CardDescription>
                Hemos enviado un enlace a <strong>{email}</strong> para restablecer tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Si no ves el correo, revisa tu carpeta de spam. El enlace expirará en 1 hora.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={() => setEmailSent(false)}
              >
                <Mail className="h-4 w-4" />
                Enviar de nuevo
              </Button>
              <Link to="/login" className="text-sm text-primary hover:underline text-center">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                <span className="text-2xl">🔑</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Enviar enlace
              </Button>
              <Link to="/login" className="text-sm text-primary hover:underline text-center">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
