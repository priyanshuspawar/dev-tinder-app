import axios, { AxiosError } from "axios";
import { ConnectionRequests, feedUser, ProfileApiResponse } from "./types";
import {
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
const API_URL = import.meta.env.VITE_API_URL;

const handleApiRequest = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall();
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.status === 401) {
        useAuthStore.getState().changeAuthStatus(false);
      }
    }
    throw err; // Re-throw the error so React Query can handle it properly
  }
};

export const getProfile = async (): Promise<ProfileApiResponse> => {
  return await handleApiRequest(async () => {
    const response = await axios.get<ProfileApiResponse>(`${API_URL}/profile`, {
      withCredentials: true,
    });
    useAuthStore.getState().changeAuthStatus(true);
    useAuthStore.getState().login({
      ...response.data.data,
    });
    return response.data;
  });
};

export const getFeed = async (page: number): Promise<feedUser[]> => {
  return await handleApiRequest(async () => {
    const response = await axios.get<{ data: feedUser[] }>(
      import.meta.env.VITE_API_URL + `/user/feed?page=${page}&limit=10`,
      {
        withCredentials: true,
      }
    );
    return response.data.data;
  });
};

export const getRequestsReceived = async (): Promise<ConnectionRequests> => {
  const res = await axios.get<{ data: ConnectionRequests }>(
    import.meta.env.VITE_API_URL + "/user/requests/received",
    {
      withCredentials: true,
    }
  );
  return res.data.data;
};

type Connections = feedUser & {
  connectionId: string;
};

export const getConnections = async (): Promise<Connections[]> => {
  const res = await axios.get<Connections[]>(`${API_URL}/user/connections`, {
    withCredentials: true,
  });
  return res.data;
};

// mutation

export const sendRequest = async ({
  status,
  userId,
}: {
  status: "ignore" | "interested";
  userId: string;
}) => {
  const response = await axios.post(
    `${API_URL}/request/send/${status}/${userId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// Swipe on the top feed card. Removes it immediately, restores it if the
// request fails, and refetches the feed once all in-flight swipes finish
// (refetching earlier could resurrect a card whose swipe is still saving).
export const useSwipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["swipe"],
    mutationFn: sendRequest,
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previousFeed = queryClient.getQueryData<feedUser[]>(["feed"]);
      queryClient.setQueryData<feedUser[]>(["feed"], (old) =>
        old?.filter((u) => u._id !== userId)
      );
      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["feed"], context?.previousFeed);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ["swipe"] }) === 1) {
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    },
  });
};

// Undo the last swipe: delete it on the server and put the card back on top.
export const useUndoSwipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: feedUser) => {
      await axios.delete(`${API_URL}/request/undo/${user._id}`, {
        withCredentials: true,
      });
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData<feedUser[]>(["feed"], (old) => [
        user,
        ...(old ?? []).filter((u) => u._id !== user._id),
      ]);
    },
  });
};

export const reviewRequest = async ({
  status,
  userId,
}: {
  status: "accepted" | "rejected";
  requestId: string;
  userId: string;
}) => {
  const response = await axios.post(
    `${API_URL}/request/review/${status}/${userId}`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

// Accept/reject a received request: optimistically drop it from the list,
// roll back on failure, then refresh requests + connections (chat list).
export const useReviewRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewRequest,
    onMutate: async ({ requestId }) => {
      await queryClient.cancelQueries({ queryKey: ["request-received"] });
      const previousRequests = queryClient.getQueryData<ConnectionRequests>([
        "request-received",
      ]);
      queryClient.setQueryData<ConnectionRequests>(
        ["request-received"],
        (old) => old?.filter((r) => r._id !== requestId)
      );
      return { previousRequests };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["request-received"], context?.previousRequests);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["request-received"] });
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
    },
  });
};

export const connectionProfileView = async (
  otherUserId: string
): Promise<feedUser> => {
  const res = await axios.get<{ data: feedUser }>(
    `${API_URL}/user/connection-profile/${otherUserId}`,
    {
      withCredentials: true,
    }
  );
  return res.data.data;
};
export const userQueryOptions: UseQueryOptions = {
  queryKey: ["user"],
  queryFn: getProfile,
  staleTime: 1000,
  retry: false,
};

export const getProfileCompletionStatus = async () => {
  const res = await axios.get<{ profileCompletion: number }>(
    `${API_URL}/profile/completion`,
    { withCredentials: true }
  );
  return res.data.profileCompletion;
};
