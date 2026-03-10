import { CreateShortUrlForm } from "../features/links/components/CreateShortUrlForm";

export function HomeWorkspace() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-8">
      <CreateShortUrlForm />
    </section>
  );
}
