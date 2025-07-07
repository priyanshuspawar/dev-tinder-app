import { connectionProfileView } from "@/queries/profile";
import useConnectionStore from "@/store/connectionStore";
import { getProfilePhoto } from "@/utils/helpers";
import { Avatar } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { redirect, useNavigate } from "react-router-dom";

type props = {
  otherUserId: string;
};

const ChatHeader = ({ otherUserId }: props) => {
  const {
    data: otherUser,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["chat-participant", otherUserId],
    queryFn: () => connectionProfileView(otherUserId),
    staleTime: 1000 * 60 * 5,
  });
  const navigation = useNavigate();
  const { onlineUsers } = useConnectionStore();
  if (isLoading) {
    return <span>Loading ...</span>;
  }
  if (error && !otherUser) {
    redirect("/error");
    return;
  }

  return (
    <div className="h-16 md:h-[10vh] flex items-center px-2 gap-2 md:py-6 md:border-l-1 border-secondary-300 bg-gradient-to-bl from-secondary-200 to-secondary-500">
      <button onClick={() => navigation(-1)}>
        <ChevronLeft className="w-5 h-5" />
      </button>
      <Avatar
        className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10"
        src={getProfilePhoto(otherUser?.pictures)}
      />
      <div className="flex flex-col">
        <label className="font-semibold text-sm md:text-base lg:text-lg">{`${otherUser?.firstName} ${otherUser?.lastName ?? ""}`}</label>

        {onlineUsers.has(otherUserId) && (
          <span className="text-xs lg:text-sm">online</span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
