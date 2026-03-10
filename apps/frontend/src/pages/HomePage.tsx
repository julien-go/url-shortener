import { useMe } from "../features/auth/hooks/useMe";
import { HomeLanding } from "./HomeLanding";
import { HomeWorkspace } from "./HomeWorkspace";

export function HomePage() {
  const meQuery = useMe();
  const isSignedIn = Boolean(meQuery.data);

  if (!isSignedIn) {
    return <HomeLanding />;
  }
  return <HomeWorkspace />;
}
