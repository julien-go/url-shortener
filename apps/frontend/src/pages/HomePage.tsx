import { DashboardLayout } from "../app/layouts/DashboardLayout";
import { useAuth } from "../app/providers/useAuth";
import { useMe } from "../features/auth/hooks/useMe";
import { CreateShortUrlForm } from "../features/links/components/CreateShortUrlForm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function HomePage() {
  const { token } = useAuth();
  const meQuery = useMe();
  const isSignedIn = Boolean(token) && Boolean(meQuery.data);

  return (
    <DashboardLayout maxWidth="lg">
      <Card className="rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Home</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create new short links and manage them from your dashboard.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {isSignedIn ? (
            <CreateShortUrlForm />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign in to create and manage your links.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
