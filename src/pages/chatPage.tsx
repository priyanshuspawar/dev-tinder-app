import { getProfilePhoto } from "@/utils/helpers";
import { Avatar, AvatarGroup, Divider, Spinner } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { ConnectionRequests } from "@/queries/types";
import { getConnections } from "@/queries/profile";
const ChatPage = () => {
  const queryClient = useQueryClient();
  const requestsReceived = queryClient.getQueryData([
    "request-received",
  ]) as ConnectionRequests;
  // const { connectionRequests: requestsReceived } = useConnectionStore();
  const numberOfRequests = requestsReceived?.length ?? 0;
  const navigation = useNavigate();
  const { data: userConnections, isLoading } = useQuery({
    queryKey: ["user-connections"],
    queryFn: getConnections,
  });
  // const {data:userConnections} = useQuery({
  //   queryKey:["user-connections"],
  //   queryFn:
  // })
  return (
    <div className="p-3 flex flex-col gap-2">
      {/* follow requests */}
      <div>
        <div
          onClick={() => {
            navigation("/dashboard/connections/review");
          }}
          className="flex items-center gap-2.5 cursor-pointer rounded-lg px-1.5 py-3"
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
      {/* WIP:chat */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Chats</span>
        <div className="flex flex-col items-center">
          {isLoading ? (
            <Spinner />
          ) : (
            userConnections?.map(({ _id, pictures, firstName }) => (
              <div className="flex w-full items-center gap-2" key={_id}>
                <Avatar src={getProfilePhoto(pictures)} />
                <div className="flex flex-col">
                  <span className="text-gray-100 font-semibold text-xs">
                    {firstName}
                  </span>
                  {/* <span className="text-gray-300 font-semibold text-xs">
                    last message
                  </span> */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
