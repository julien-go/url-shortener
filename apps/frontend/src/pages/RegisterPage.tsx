import { AuthLayout } from "../features/auth/components/AuthLayout";
import { RegisterForm } from "../features/auth/components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout title="Create account">
      <RegisterForm />
    </AuthLayout>
  );
}
