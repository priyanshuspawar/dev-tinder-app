import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components go here */}
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
