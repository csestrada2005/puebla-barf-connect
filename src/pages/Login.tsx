import { Layout } from "@/components/layout";
import { LoginForm } from "@/components/auth";

export default function Login() {
  return (
    <Layout>
      <div className="container py-12 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <LoginForm />
      </div>
    </Layout>
  );
}
