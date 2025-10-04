
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";

const setAdminRoleUrl = 'https://us-central1-studio-4432826442-a8369.cloudfunctions.net/setUserRole';

async function setAdminRoleWithHttp(email, role, token) {
  const response = await fetch(setAdminRoleUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha ao definir o papel do usuário');
  }

  return response.json();
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selfPromoteLoading, setSelfPromoteLoading] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then((idTokenResult) => {
        setIsUserAdmin(!!idTokenResult.claims.admin);
      });
    }
  }, [user]);

  const handleSetRole = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setResult("");
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await setAdminRoleWithHttp(email, role, token);

      setResult(`Sucesso: ${response.message}`);
      toast({
        title: "Sucesso!",
        description: `O usuário ${email} agora tem o papel de ${role}.`,
      });
    } catch (err) {
      // @ts-ignore
      setError(err.message);
      toast({
        title: "Erro!",
        // @ts-ignore
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelfPromote = async () => {
    if (!user || !user.email) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer isso.",
        variant: "destructive",
      });
      return;
    }
    setSelfPromoteLoading(true);
    try {
      const token = await user.getIdToken();
      await setAdminRoleWithHttp(user.email, "admin", token);

      toast({
        title: "Sucesso!",
        description: "Você agora é um administrador.",
      });

      // Força a atualização do token para refletir a nova permissão
      await user.getIdToken(true);

      // **A MUDANÇA CRUCIAL**
      // Em vez de recarregar a página, nós manualmente atualizamos o estado.
      // Isso fará o React renderizar o painel de admin instantaneamente.
      setIsUserAdmin(true);

    } catch (err) {
      // @ts-ignore
      toast({
        title: "Erro ao se auto-promover",
        // @ts-ignore
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSelfPromoteLoading(false);
    }
  };

  if (authLoading) {
    return <div>Carregando...</div>;
  }

  if (!isUserAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Esta página é restrita a administradores.</p>
        <Button
          onClick={handleSelfPromote}
          disabled={selfPromoteLoading || !user}
          className="mt-6"
        >
          {selfPromoteLoading
            ? "Promovendo..."
            : "Tornar-se Administrador (Ação de Emergência)"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Controle do Admin</h1>
      <form onSubmit={handleSetRole} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email do Usuário
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Papel (ex: 'admin', 'ADM')
          </label>
          <Input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="admin"
            required
            className="mt-1 block w-full"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Definindo..." : "Definir Papel"}
        </Button>
      </form>
    </div>
  );
}
