import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useSideBarStore from "@/store/sidebarStore";
import { useMediaQuery } from "usehooks-ts";
import { Icon } from "@iconify/react";
import { cn, getProfilePhoto } from "@/utils/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConnections,
  getRequestsReceived,
  useReviewRequest,
} from "@/queries/profile";
import Loader from "@/components/Loader";
import { Avatar, Button, Spinner, Tab, Tabs } from "@heroui/react";
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

  const requestLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location, so DevTinder can't find developers near you.");
      return;
    }
    // While the permission prompt is open neither callback fires
    // (timeout only starts after permission), so the UI shows a waiting screen.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation([position.coords.longitude, position.coords.latitude]);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked. Allow location for this site in your browser settings, then try again."
            : "Couldn't get your location. Check that location services are on, then try again."
        );
        console.error(err);
      },
      { timeout: 15000 }
    );
  };

  useEffect(requestLocation, []);

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
  const { mutate: reviewRequest } = useReviewRequest();
  const { setSocket, socket: socketSaved } = useSocket();
  const { setUserConnections, addOnlineUser, removeOnlineUser, onlineUsers } =
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
    // server pushes these when someone sends/undoes a request or accepts yours
    const refreshRequests = () =>
      queryClient.invalidateQueries({ queryKey: ["request-received"] });
    const refreshConnections = () =>
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
    socket.on("onlineFriends", getOnlineFriends);
    socket.on("friendOnline", handleFriendOnline);
    socket.on("friendOffline", handleFriendOffline);
    socket.on("requestsChanged", refreshRequests);
    socket.on("connectionsChanged", refreshConnections);
    return () => {
      socket.disconnect();
      socket.off("friendOnline", handleFriendOnline);
      socket.off("onlineFriends", getOnlineFriends);
      socket.off("friendOffline", handleFriendOffline);
      socket.off("requestsChanged", refreshRequests);
      socket.off("connectionsChanged", refreshConnections);
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
  if (error || (user && !geoLocation)) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Icon icon="akar-icons:location" className="w-10 h-10 text-primary-500" />
        <h2 className="text-xl font-semibold">
          {error ? "Location needed" : "Waiting for location access"}
        </h2>
        <p className="max-w-sm text-sm text-default-500">
          {error ??
            "DevTinder uses your location to show developers near you. Allow access in your browser's prompt to continue."}
        </p>
        {error ? (
          <Button color="primary" radius="full" onPress={requestLocation}>
            Try again
          </Button>
        ) : (
          <Spinner size="sm" />
        )}
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
                <img src="/brand/devtinder-code-heart-horizontal-white.svg" alt="DevTinder" className="h-8" />
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
                <Link to={"/dashboard"} aria-label="Back to the feed">
                  <img
                    src="/brand/devtinder-code-heart-icon.svg"
                    alt=""
                    className="w-9 h-9 hover:scale-110 transition-transform duration-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                  />
                </Link>
              )}
              <Link
                to="profile/settings"
                aria-label="Settings"
                className="bg-secondary-50 flex p-1.5 rounded-full cursor-pointer"
              >
                <Icon className="text-xl" icon={"ant-design:setting-filled"} />
              </Link>
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
                            aria-label={`Accept ${request.fromUserId.firstName}`}
                            onPress={() => {
                              reviewRequest({
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
                            aria-label={`Reject ${request.fromUserId.firstName}`}
                            onPress={() => {
                              reviewRequest({
                                status: "rejected",
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
                            <Avatar src={getProfilePhoto(connection.pictures)} />
                            <h3 className="font-medium flex-grow">
                              {connection.firstName}
                            </h3>
                            {onlineUsers.has(connection._id) && (
                              <Dot className="text-success-500" aria-label="online" />
                            )}
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
                "flex justify-evenly w-full h-fit pt-3 pb-3",
                location.pathname == "/dashboard"
                  ? "bg-gradient-to-b from-black/80 to-black"
                  : "bg-secondary-50"
              )}
            >
              <Icon
                icon={"material-symbols:star-rounded"}
                onClick={() => navigation("/dashboard")}
                className={cn(
                  location.pathname == "/dashboard"
                    ? "text-secondary-500"
                    : "text-default-500 hover:text-default-700",
                  "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out w-8 h-8"
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
                    "text-3xl cursor-pointer transition-all transform duration-250 ease-in-out w-8 h-8"
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
                className="cursor-pointer w-8 h-8"
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
