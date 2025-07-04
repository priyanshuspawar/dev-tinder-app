import { motion } from "framer-motion";

const NoChats = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full flex justify-center mb-4">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
          src="/chat-default.svg"
          className="mr-6"
        />
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            delay: 0.2,
          }}
          src="/chat-grad.svg"
          className="absolute bottom-0 ml-24"
        />
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold">Say Hello 👋</h3>
        <p className="font-medium text-default-500 text-sm tracking-wide text-center my-4">
          Looking to strike up a conversation? when you match with others, you
          can sed them a message under "Matches"
        </p>
      </div>
    </div>
  );
};

export default NoChats;
