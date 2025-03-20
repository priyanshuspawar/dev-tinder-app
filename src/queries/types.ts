import z from "zod";
import { updateSchema } from "@/utils/validation-schema";

type Essentials = {
  education?: string;
  location?: string;
};
type skill = {
  _id: string;
  label: string;
};

type Pictures = {
  _id: string;
  imgUrl: string;
};

type UserProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: skill[]; // Array of skills
  about?: string;
  pictures: Pictures[]; // Array of picture URLs
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  lookingFor?:
    | "Still figuring out"
    | "Dynamic Duo"
    | "Tech Partner"
    | "Short Term"
    | "Gonna go with flow";
  essentials: Essentials; // Essentials object containing education and location
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};

type feedUser = {
  _id: string;
  firstName: string;
  lastName: string;
  skills: skill[]; // Array of skills
  about?: string;
  pictures: Pictures[]; // Array of picture URLs
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  lookingFor?:
    | "Still figuring out"
    | "Dynamic Duo"
    | "Tech Partner"
    | "Short Term"
    | "Gonna go with flow";
  essentials: Essentials; // Essentials object containing education and location
};

type ConnectionRequests = {
  _id: string;
  fromUserId: feedUser;
}[];

type ProfileApiResponse = {
  data: UserProfile;
};

type imageUploadApiResponse = {
  data: { imgUrl: string }[];
  message: string; // Response message (e.g., "images uploaded")
};
type UpdateProfile = z.infer<typeof updateSchema>;
export type {
  ProfileApiResponse,
  UserProfile,
  imageUploadApiResponse,
  UpdateProfile,
  feedUser,
  ConnectionRequests,
};
