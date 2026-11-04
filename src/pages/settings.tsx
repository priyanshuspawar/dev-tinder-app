import { logout } from "@/queries/auth-queries";
import useAuthStore from "@/store/authStore";
import useChatsStore from "@/store/chatsStore";
import useConnectionStore from "@/store/connectionStore";
import { useNotificationStore } from "@/store/notificationStore";
import useSocket from "@/store/socketStore";
import { addToast, Card } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileSettings = () => {
  const { socket } = useSocket();
  const navigation = useNavigate();
  const { logout: logoutStore } = useAuthStore();
  const { resetConnections } = useConnectionStore();
  const { resetNotifications } = useNotificationStore();
  const { removeAllChats } = useChatsStore();
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationKey: ["logout"],
    mutationFn: logout,
  });
  const handleLogout = async () => {
    try {
      await mutateAsync();
      socket?.disconnect();
      // clear all client state so the next user on this browser starts clean
      queryClient.clear();
      logoutStore();
      resetConnections();
      resetNotifications();
      removeAllChats();
      addToast({
        title: "Successfully logged out",
        color: "success",
      });
      navigation("/login", { replace: true });
    } catch (error) {
      addToast({
        title: "Logout failed",
        color: "danger",
      });
    }
  };
  return (
    <div className="py-10 px-4 w-full h-full flex flex-col gap-2">
      <span className="flex items-center">
        <button aria-label="Back" onClick={() => navigation(-1)}>
          <ChevronLeft />
        </button>
        <h1 className="font-semibold">Settings</h1>
      </span>
      <Card
        className="flex-row p-2 items-center justify-between"
        isPressable
        isHoverable
        onPress={handleLogout}
      >
        <label className="text-lg">Logout</label>
        <LogOut />
      </Card>
    </div>
  );
};

export default ProfileSettings;
