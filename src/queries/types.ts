type UserProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  skills: string[]; // Assuming skills are stored as an array of strings
  about: string | null;
  pictureUrl: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};

type ProfileApiResponse = {
  data: UserProfile;
};

export type { ProfileApiResponse };
