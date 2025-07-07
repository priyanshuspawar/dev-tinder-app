import axios, { AxiosError } from "axios";
import { ConnectionRequests, feedUser, ProfileApiResponse } from "./types";
import { UseQueryOptions } from "@tanstack/react-query";
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
