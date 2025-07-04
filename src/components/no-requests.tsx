import { motion } from "framer-motion";

const NoRequests = () => {
  return (
    <div className="flex w-full justify-center flex-col">
      <div className="w-full flex justify-center">
        <motion.div
          initial={{ rotate: 20 }}
          animate={{ rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="absolute bg-gradient-to-br from-secondary-200 to-secondary-500 aspect-[9/14] w-28 rounded-lg"
        />
        <div className="aspect-[9/14] w-28 rounded-lg bg-background ml-10 mt-6" />
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold">Start Matching</h3>
        <p className="font-medium text-default-500 text-sm tracking-wide text-center my-6">
          Matches will appear here once you start to like people. You can
          message them directly from here when you're ready to spark up the
          bondig
        </p>
      </div>
    </div>
  );
};

export default NoRequests;
