import { Spinner } from "@heroui/react";

const Loader = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
};

export default Loader;
