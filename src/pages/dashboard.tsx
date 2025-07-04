import { useEffect, useState } from "react";
import FeedCard from "@/components/feed-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFeed } from "@/queries/profile";
import { Avatar } from "@heroui/react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { cn, getProfilePhoto } from "@/utils/helpers";
import { Bug } from "lucide-react";
import useAuthStore from "@/store/authStore";
import useSocket from "@/store/socketStore";

const Dashboard = () => {
  const { isBottomNavActive } = useOutletContext<{
    isFullModeActive: boolean;
    isBottomNavActive: boolean;
  }>();
  const [page, setPage] = useState(1);
  const { socket } = useSocket();
  const { data: feed, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => getFeed(page),
  });
  const [profileActiveSlide, setProfileActiveSlide] = useState(0);
  const { user } = useAuthStore();
  if (!user) {
    return;
  }
  return (
    <div
      className={cn(
        "h-full flex flex-col items-center relative",
        !isBottomNavActive
          ? "w-[21rem] lg:w-[23rem] xl:w-[24rem] 2xl:w-[25rem]"
          : "w-full"
      )}
    >
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center h-[88%] rounded-lg bg-default-50 transition-all animate-pulse">
            <motion.div
              className="rounded-full bg-primary-500/20"
              style={{
                width: "20rem",
                height: "20rem",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #FCADF9",
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0.8, 1, 0.5],
              }}
              transition={{
                times: [0, 0.5, 1],
                duration: 2, // This should slow down the animation
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
              }}
            />
            <Avatar
              src={getProfilePhoto(user?.pictures)}
              className="w-28 h-28 absolute"
            />
          </div>
        </div>
      ) : !feed || feed.length == 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="bg-secondary-50 h-[90%] w-full gap-4 rounded-lg overflow-hidden flex flex-col items-center justify-center">
            <Bug className="w-20 h-20 text-default-500" />
            <p className="w-4/6 text-center font-medium text-default-500">
              No more users available right now please try later 👋
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {feed.map((card) => (
            <FeedCard
              activeSlide={profileActiveSlide}
              setActiveSlide={setProfileActiveSlide}
              key={card._id}
              {...card}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
