import { Loader } from "lucide-react";

export const LoadingState = () => (
  <div className="h-52 flex flex-col items-center justify-center gap-2">
    <Loader className="animate-spin size-6" />
    <p className="ml-1 animate-pulse">Loading...</p>
  </div>
);
