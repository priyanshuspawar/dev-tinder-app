import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useSideBarStore from "@/store/sidebarStore";
import { useMediaQuery } from "usehooks-ts";
import { Icon } from "@iconify/react";
import { cn, getProfilePhoto } from "@/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConnections,
  getRequestsReceived,
  reviewRequest,
} from "@/queries/profile";
import Loader from "@/components/Loader";
import { Avatar, Button, Tab, Tabs } from "@heroui/react";
import { feedUser } from "@/queries/types";
import { Check, Dot, X } from "lucide-react";
import NoRequests from "@/components/no-requests";
import NoChats from "@/components/no-chats";
import { useEffect, useState } from "react";
import { createSocketConnection } from "@/utils/socket";
import useSocket from "@/store/socketStore";
import useConnectionStore from "@/store/connectionStore";
import { Message } from "@/queries/chatQueries";
import { useNotificationStore } from "@/store/notificationStore";
import useChatsStore from "@/store/chatsStore";
import useAuthStore from "@/store/authStore";

type ServerMessage = {
  _id: string;
  chatId: string;
  senderId: string;
  content: {
    type: "text" | "image" | "file";
    text?: string;
    uri?: string;
  };
  createdAt: string;
  updatedAt: string;
  referenceMessageId?: string;
  status: "sent" | "delivered" | "read";
  //extras
  connectionId?: string;
  isUnread?: boolean;
  isSentByCurrentUser?: boolean;
};
type chatUpdate = {
  type: "read-status" | "receive-message";
  chatId: string;
  message: ServerMessage;
};

const DashboardLayout = () => {
  const queryClient = useQueryClient();
  const { user, setLocation } = useAuthStore();
  const [geoLocation, setGeoLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation([position.coords.longitude, position.coords.latitude]);
      },
      (err) => {
        setError("Location permission denied or unavailable");
        console.error(err);
      }
    );
  }, []);

  const { data: requestsReceived, isLoading } = useQuery({
    queryKey: ["request-received"],
    queryFn: getRequestsReceived,
    retryDelay: 1 * 60000,
  });
  const { data: userConnections } = useQuery({
    queryKey: ["user-connections"],
    queryFn: getConnections,
  });
  const { isFullModeActive } = useSideBarStore();
  const isBottomNavActive = useMediaQuery("(max-width: 895px)");
  const location = useLocation();
  const navigation = useNavigate();
  const { mutateAsync } = useMutation({
    mutationFn: reviewRequest,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previousFeed = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(["feed"], (old: feedUser[]) => [
        ...old.slice(1),
      ]);
      return { previousFeed };
    },
    onError: (context: { previousFeed: feedUser[] }) => {
      queryClient.setQueryData(["feed"], context.previousFeed);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
  const { setSocket, socket: socketSaved } = useSocket();
  const { setUserConnections, addOnlineUser, removeOnlineUser } =
    useConnectionStore();
  useEffect(() => {
    if (userConnections) {
      setUserConnections(userConnections);
    }
  }, [userConnections]);

  useEffect(() => {
    if (!geoLocation) return;
    const socket = createSocketConnection(geoLocation);
    setSocket(socket);
    const getOnlineFriends = (users: string[]) => {
      addOnlineUser(users);
    };
    const handleFriendOnline = ({ userId }: { userId: string }) => {
      // mark this friend as online in your UI
      // setUserStatus(userId, "online");
      addOnlineUser([userId]);
    };
    const handleFriendOffline = ({ userId }: { userId: string }) => {
      // mark this friend as offline in your UI
      removeOnlineUser(userId);
      // setUserStatus(userId, undefined);
    };
    if (socket) {
      socket.on("onlineFriends", getOnlineFriends);
      socket.on("friendOnline", handleFriendOnline);

      socket.on("friendOffline", handleFriendOffline);
    }
    return () => {
      socket.disconnect();
      socket.off("friendOnline", handleFriendOnline);
      socket.off("onlineFriends", getOnlineFriends);

      socket.off("friendOffline", handleFriendOffline);
    };
  }, [geoLocation]);
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [hasMoreUnread, setHasMoreUndread] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const { addNewChatMessages, newChatMessages } = useNotificationStore();
  const { addMessageToChatAfter, updateMessageStatus } = useChatsStore();
  const handleChatUpdate = ({ type, chatId, message }: chatUpdate) => {
    switch (type) {
      case "read-status":
        updateMessageStatus(chatId, { ...message });
        break;
      case "receive-message":
        if (!message.connectionId) return;
        if (window.location.pathname.startsWith("/dashboard/chat/")) {
          addMessageToChatAfter(message.chatId, [
            {
              ...message,
              isUnread: message?.isUnread!!,
              isSentByCurrentUser: message?.isSentByCurrentUser!!,
            },
          ]);
        }
        addNewChatMessages({ [message.connectionId]: [message as Message] });
        updateMessageStatus(chatId, { ...message });
        // 🔁 Emit delivered status
        if (!socketSaved) return;
        socketSaved.emit("messageReceivedAck", {
          messageId: message._id,
          chatId: message.chatId,
          status: "delivered",
        });
        break;
    }
  };

  useEffect(() => {
    if (!socketSaved?.connected) return;
    if (hasMoreUnread) {
      socketSaved.emit(
        "fetchUnread",
        { page, limit },
        (response: {
          groupedMessages: Record<string, Message[]>;
          hasMore: boolean;
        }) => {
          addNewChatMessages(response.groupedMessages);
          Object.entries(response.groupedMessages).forEach(async (item) => {
            if (item[1]) {
              await Promise.all(
                item[1].map((msg) =>
                  socketSaved.emit("messageReceivedAck", {
                    messageId: msg._id,
                    chatId: msg.chatId,
                    status: "delivered",
                  })
                )
              );
            }
          });
          setPage((prev) => prev + 1);
          setHasMoreUndread(response.hasMore);
        }
      );
    }

    const handleDeliveredAck = ({
      messageId,
      chatId,
      status,
    }: {
      messageId: string;
      chatId: string;
      status: "read" | "delivered" | "sent";
    }) => {
      updateMessageStatus(chatId, { status, _id: messageId });
    };

    socketSaved.on("messageDeliveredAck", handleDeliveredAck);
    socketSaved.on("chatUpdate", handleChatUpdate);
    return () => {
      socketSaved.off("messageDeliveredAck", handleDeliveredAck);
      socketSaved.off("chatUpdate", handleChatUpdate);
    };
  }, [socketSaved?.connected, page]);
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Please Provide location service to continue</p>
      </div>
    );
  }
  if (isLoading || !user || !geoLocation) {
    return <Loader />;
  }
  return (
    <div className="w-full h-screen overflow-hidden">
      <div
        className={cn(
          isBottomNavActive ? "flex-col" : "flex-row",
          "w-full h-full flex overflow-y-clip relative"
        )}
      >
        {!location.pathname.includes("/dashboard/profile") &&
          !location.pathname.includes("/dashboard/chat") &&
          isBottomNavActive &&
          !isFullModeActive && (
            <section className="">
              <div className="w-full py-1.5 px-3.5 bg-gradient-to-bl from-secondary-200 to-secondary-500">
                <h2 className="w-full font-medium text-xl">DevTinder ✨</h2>
              </div>
            </section>
          )}
        {!isBottomNavActive && (
          <aside className="flex flex-col w-[20rem] flex-shrink-0 lg:w-[25rem] xl:w-[28rem] 2xl:w-[30rem] h-full bg-secondary-50">
            <div className="flex items-center px-2 justify-between w-full h-[10vh] bg-gradient-to-br from-secondary-200 to-secondary-500">
              {/* avatar and home */}
              {location.pathname === "/dashboard" ? (
                <Link to={"profile"}>
                  <span className="flex items-center gap-1 hover:bg-black/5 p-1.5 rounded-3xl cursor-pointer">
                    <Avatar size="sm" src={getProfilePhoto(user.pictures)} />
                    <span className="text-sm font-semibold">You</span>
                  </span>
                </Link>
              ) : (
                <Link to={"/dashboard"}>
                  <span className="w-7 flex cursor-pointer hover:scale-110 transition-all duration-200 ease-linear items-center justify-center font-bold aspect-square bg-background rounded-full">
                    D
                  </span>
                </Link>
              )}
              <div>
                <span className="bg-secondary-50 flex p-1.5 rounded-full cursor-pointer">
                  <Icon
                    className="text-xl"
                    icon={"ant-design:setting-filled"}
                  />
                </span>
              </div>
            </div>

            <Tabs variant="underlined" color="primary">
              <Tab title={"Requests"} className="font-semibold">
                <ul className="px-2.5">
                  {!requestsReceived || requestsReceived.length === 0 ? (
                    <NoRequests />
                  ) : (
                    requestsReceived.map((request) => (
                      <li
                        key={request._id}
                        onClick={() => {
                          navigation(
                            `/dashboard/connection/profile/${request.fromUserId._id}`
                          );
                        }}
                        className="w-full flex items-center gap-1"
                      >
                        <div className="flex flex-grow items-center gap-2 cursor-pointer">
                          <Avatar
                            size="lg"
                            src={getProfilePhoto(request.fromUserId.pictures)}
                          />
                          <span className="font-medium text-gray-200">
                            {request.fromUserId.firstName}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            color="success"
                            size="sm"
                            variant="solid"
                            className="rounded-full"
                            onPress={() => {
                              mutateAsync({
                                status: "accepted",
                                userId: request.fromUserId._id,
                                requestId: request._id,
                              });
                            }}
                          >
                            <Check />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="solid"
                            size="sm"
                            className="rounded-full"
                            onPress={() => {
                              mutateAsync({
                                status: "accepted",
                                userId: request.fromUserId._id,
                                requestId: request._id,
                              });
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </Tab>
              <Tab title={"Chat"} className="font-semibol">
                {!userConnections ? (
                  <NoChats />
                ) : userConnections.length > 0 ? (
                  <div className="w-full flex flex-col items-center px-2 overflow-hidden">
                    {userConnections.map((connection) => {
                      return (
                        <Link
                          key={connection._id}
                          to={`chat/${connection.connectionId}`}
                          className="w-full"
                        >
                          <div className="w-full flex items-center gap-2 cursor-pointer p-2 hover:scale-105 transition-all duration-300 ease-in-out rounded-xl">
                            <Avatar src={connection.pictures[0].imgUrl} />
                            <h3 className="font-medium flex-grow">
                              {connection.firstName}
                            </h3>
                            <Dot className="text-success-500" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <NoChats />
                )}
              </Tab>
            </Tabs>
          </aside>
        )}
        <section
          className={cn(
            "flex w-full h-full relative md:items-center md:justify-center"
          )}
        >
          <Outlet
            context={{
              isFullModeActive,
              isBottomNavActive,
              geoLocation,
            }}
          />
        </section>
        {isBottomNavActive &&
          !location.pathname.includes("/dashboard/profile/edit") &&
          !location.pathname.includes("/dashboard/chat") && (
            <section
              className={cn(
                "flex justify-evenly w-full h-fit",
                location.pathname == "/dashboard"
                  ? "pb-3 bg-gradient-to-b from-black/80 to-black"
                  : "pb-3 pt-3 bg-secondary-50"
              )}
            >
              <Icon
                icon={"material-symbols:star-rounded"}
                onClick={() => navigation("/dashboard")}
                className={cn(
                  location.pathname == "/dashboard"
                    ? "text-secondary-500"
                    : "text-default-500 hover:text-default-700",
                  "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out w-9 h-9"
                )}
              />
              <span
                onClick={() => {
                  navigation("/dashboard/connections");
                }}
                className="relative"
              >
                <Icon
                  icon={"lets-icons:chat-alt-fill"}
                  className={cn(
                    location.pathname == "/dashboard/connections"
                      ? "text-secondary-500"
                      : "text-default-500 hover:text-default-700",
                    "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out w-9 h-9"
                  )}
                />
                {Object.keys(newChatMessages).length > 0 && (
                  <span className="absolute bg-default-100 rounded-full flex justify-center items-center text-[8px] font-semibold w-3 h-3 top-0 right-0">
                    {Object.keys(newChatMessages).length}
                  </span>
                )}
              </span>
              <Avatar
                isBordered={location.pathname.includes("/dashboard/profile")}
                className="cursor-pointer w-9 h-9"
                onClick={() => navigation("/dashboard/profile")}
                color="primary"
                size="sm"
                src={getProfilePhoto(user.pictures)}
              />
              {/* <Icon
                icon={"gridicons:user"}
                onClick={() => navigation("/dashboard/profile")}
                className={cn(
                  location.pathname.includes("/dashboard/profile")
                    ? "text-secondary-500"
                    : "text-default-500 hover:text-default-700",
                  "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out"
                )}
              /> */}
            </section>
          )}
      </div>
    </div>
  );
};

export default DashboardLayout;
