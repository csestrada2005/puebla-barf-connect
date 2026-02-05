import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Loader2,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SubscriptionsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch subscriptions with profile data
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["admin-subscriptions-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch profiles for lookup
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, family_name, email, phone");
      if (error) throw error;
      return data || [];
    },
  });

  const getProfile = (userId: string) => profiles?.find(p => p.id === userId);

  // Filter subscriptions
  const filteredSubs = subscriptions?.filter((sub) => {
    const profile = getProfile(sub.user_id);
    const matchesSearch = 
      profile?.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.protein_line?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && sub.status === statusFilter;
  }) || [];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-0">Activa</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">Pausada</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-0">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate stats
  const activeCount = subscriptions?.filter(s => s.status === "active").length || 0;
  const pausedCount = subscriptions?.filter(s => s.status === "paused").length || 0;
  const cancelledCount = subscriptions?.filter(s => s.status === "cancelled").length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
              <Package className="h-8 w-8 text-green-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pausedCount}</p>
                <p className="text-xs text-muted-foreground">Pausadas</p>
              </div>
              <Package className="h-8 w-8 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
              <Package className="h-8 w-8 text-red-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Suscripciones
              </CardTitle>
              <CardDescription>{filteredSubs.length} suscripciones</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredSubs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Cliente</th>
                    <th className="text-left py-3 px-2">Plan</th>
                    <th className="text-left py-3 px-2">Proteína</th>
                    <th className="text-left py-3 px-2">Frecuencia</th>
                    <th className="text-left py-3 px-2">Próx. Entrega</th>
                    <th className="text-left py-3 px-2">Estado</th>
                    <th className="text-left py-3 px-2">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((sub) => {
                    const profile = getProfile(sub.user_id);
                    return (
                      <tr key={sub.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{profile?.family_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{profile?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="capitalize">{sub.plan_type}</span>
                          <p className="text-xs text-muted-foreground">{sub.presentation}</p>
                        </td>
                        <td className="py-3 px-2 capitalize">{sub.protein_line}</td>
                        <td className="py-3 px-2 capitalize">{sub.frequency}</td>
                        <td className="py-3 px-2">
                          {sub.next_delivery_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(sub.next_delivery_date), "d MMM", { locale: es })}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium">{sub.points || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay suscripciones</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
