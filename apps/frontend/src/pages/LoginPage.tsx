import { AuthLayout } from "../features/auth/components/AuthLayout";
import { LoginForm } from "../features/auth/components/LoginForm";
import { appConfig } from "../config/app";
import { useDocumentTitle } from "../lib/hooks/useDocumentTitle";

export function LoginPage() {
  useDocumentTitle(`Sign in - ${appConfig.appName}`);

  return (
    <AuthLayout title="Sign in">
      <LoginForm />
    </AuthLayout>
  );
}
