import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-foreground">404</h1>
        <p className="text-2xl mt-4">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button
          color="primary"
          type="submit"
          className="mt-8"
          // className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center mx-auto"
          onPress={() => navigate("/", { replace: true })}
        >
          {/* <HomeIcon className="w-5 h-5 mr-2" />
           */}
          <Icon className="w-5 h-5 mr-2" icon={"mdi-light:home"} />
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
