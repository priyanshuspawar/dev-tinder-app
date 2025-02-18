import axios from "axios";
import { ProfileApiResponse } from "./types";

export const getProfile = async (): Promise<ProfileApiResponse> => {
  const response = await axios.get<ProfileApiResponse>(
    import.meta.env.VITE_API_URL + "/profile",
    {
      withCredentials: true,
    }
  );
  return response.data;
};
