import { useState } from "react";
import FeedCard from "@/components/feed-card";
import { useQuery } from "@tanstack/react-query";
import {
  getFeed,
  getProfileCompletionStatus,
  useSwipe,
  useUndoSwipe,
} from "@/queries/profile";
import { feedUser } from "@/queries/types";
import { addToast, Avatar, Button, Chip, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cn, getProfilePhoto } from "@/utils/helpers";
import { Bug } from "lucide-react";
import useAuthStore from "@/store/authStore";

const Dashboard = () => {
  const { isBottomNavActive } = useOutletContext<{
    isFullModeActive: boolean;
    isBottomNavActive: boolean;
    geoLocation: {
      lat: number;
      lng: number;
    };
  }>();
  const { data: profilePercentage = 0, isPending: isCompletionPending } = useQuery({
    queryKey: ["profile-completion"],
    queryFn: getProfileCompletionStatus,
    refetchOnMount: true,
  });
  // ponytail: always page 1 — the server excludes users you've already swiped,
  // so refetching page 1 after swipes yields the next unseen batch.
  const { data: feed, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => getFeed(1),
  });
  const swipe = useSwipe();
  const undo = useUndoSwipe();
  const [lastSwiped, setLastSwiped] = useState<feedUser | null>(null);
  const topCard = feed?.[0];
  const handleSwipe = (status: "interested" | "ignore") => {
    if (!topCard) return;
    setLastSwiped(topCard);
    swipe.mutate(
      { status, userId: topCard._id },
      {
        onError: () => {
          setLastSwiped(null);
          addToast({ title: "Couldn't save that swipe, try again", color: "danger" });
        },
      }
    );
  };
  const handleUndo =
    lastSwiped && !swipe.isPending && !undo.isPending
      ? () =>
          undo.mutate(lastSwiped, {
            onSuccess: () => setLastSwiped(null),
            onError: () => {
              setLastSwiped(null);
              addToast({ title: "Can't undo that one anymore", color: "warning" });
            },
          })
      : undefined;
  const { user } = useAuthStore();
  const navigation = useNavigate();
  if (!user) {
    return;
  }
  // still loading: don't flash the "complete your profile" gate at complete profiles
  if (isCompletionPending) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (profilePercentage < 70) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Chip
          className="font-semibold text-xs cursor-pointer select-none"
          color="danger"
          variant="shadow"
          onClick={() => {
            navigation("/dashboard/profile/edit", { state: { onboarding: true } });
          }}
        >
          Please Complete Your Profile to 70%
        </Chip>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "h-full overflow-hidden",
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
      ) : !topCard ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="bg-secondary-50 h-[90%] w-full gap-4 rounded-lg overflow-hidden flex flex-col items-center justify-center">
            <Bug className="w-20 h-20 text-default-500" />
            <p className="w-4/6 text-center font-medium text-default-500">
              No more users available right now please try later 👋
            </p>
            {handleUndo && (
              <Button variant="flat" color="warning" radius="full" onPress={handleUndo}>
                Undo last swipe
              </Button>
            )}
          </div>
        </div>
      ) : (
        // only the top card is rendered; key resets its drag + photo state
        <FeedCard
          key={topCard._id}
          {...topCard}
          onSwipe={handleSwipe}
          onUndo={handleUndo}
        />
      )}
    </div>
  );
};

export default Dashboard;
