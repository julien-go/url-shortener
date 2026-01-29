import { CreateShortUrlForm } from "../features/links/components/CreateShortUrlForm";

export const HomePage = () => {
  return (
    <div>
      <h1 className="p-6 text-3xl font-bold text-red-500">URL Shortener</h1>
      <CreateShortUrlForm></CreateShortUrlForm>
    </div>
  );
};
