export const dynamic = "force-dynamic";

import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <LoginForm />
    </div>
  );
}
