import { Layout } from "@/components/layout";
import { RegisterForm } from "@/components/auth";

export default function Registro() {
  return (
    <Layout>
      <div className="container py-12">
        <RegisterForm />
      </div>
    </Layout>
  );
}
