import { getProfilePhoto } from "@/utils/helpers";
import { Avatar, AvatarGroup, Divider, Spinner } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { ConnectionRequests } from "@/queries/types";
import { useMediaQuery } from "usehooks-ts";
import useConnectionStore from "@/store/connectionStore";
import { Dot } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
const ConnectionsPage = () => {
  const queryClient = useQueryClient();
  const requestsReceived = queryClient.getQueryData([
    "request-received",
  ]) as ConnectionRequests;
  // const { connectionRequests: requestsReceived } = useConnectionStore();
  const numberOfRequests = requestsReceived?.length ?? 0;
  const navigation = useNavigate();
  const { userConnections, onlineUsers } = useConnectionStore();
  const { newChatMessages } = useNotificationStore();

  const isBottomNavActive = useMediaQuery("(max-width: 895px)");
  if (!isBottomNavActive) redirect("/dashboard");
  return (
    <div className="w-full p-3 flex flex-col gap-2">
      {/* follow requests */}
      <div>
        <div
          onClick={() => {
            navigation("/dashboard/connections/review");
          }}
          className="flex items-center gap-2.5 cursor-pointer rounded-lg px-1 py-3"
        >
          <AvatarGroup max={2} className="pointer-events-none">
            {numberOfRequests ? (
              requestsReceived.map((request) => (
                <Avatar
                  key={request._id}
                  size="sm"
                  src={getProfilePhoto(request?.fromUserId?.pictures)}
                />
              ))
            ) : (
              <Icon icon={"iconoir:user-plus"} />
            )}
          </AvatarGroup>
          <div className="flex flex-col flex-grow">
            <span className="text-xs font-semibold">Cupid requests</span>
            {!requestsReceived || numberOfRequests == 0 ? (
              <span className="text-xs font-medium text-gray-400">
                Approve or decline requests
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-400">
                {requestsReceived[0].fromUserId.firstName}
                {requestsReceived.length > 1 &&
                  `+ ${requestsReceived.length} ..`}
              </span>
            )}
          </div>
          <Icon icon="icon-park-outline:right" />
        </div>
        <Divider />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Chats</span>
        <div className="flex flex-col items-center gap-4">
          {!userConnections ? (
            <Spinner />
          ) : (
            userConnections.map(
              ({ _id, pictures, firstName, connectionId }) => (
                <Link
                  key={_id}
                  to={`/dashboard/chat/${connectionId}`}
                  className="w-full"
                >
                  <div className="flex w-full items-center gap-2">
                    <Avatar src={getProfilePhoto(pictures)} />
                    <div className="flex flex-col flex-grow leading-none">
                      <span className="text-default-700 font-semibold text-xs">
                        {firstName}
                      </span>
                      {newChatMessages[connectionId] &&
                        newChatMessages[connectionId].length > 0 && (
                          <span className="text-[0.65rem]  lg:text-xs font-semibold">
                            {newChatMessages[connectionId].length + " "}
                            new messages
                          </span>
                        )}
                    </div>
                    {onlineUsers.has(_id) && (
                      <Dot className="text-success-500" />
                    )}
                  </div>
                </Link>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
