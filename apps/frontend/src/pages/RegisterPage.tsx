import { AuthLayout } from "../features/auth/components/AuthLayout";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import { appConfig } from "../config/app";
import { useDocumentTitle } from "../lib/hooks/useDocumentTitle";

export function RegisterPage() {
  useDocumentTitle(`Create account - ${appConfig.appName}`);

  return (
    <AuthLayout title="Create account">
      <RegisterForm />
    </AuthLayout>
  );
}
