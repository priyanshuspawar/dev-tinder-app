import { feedUser, UserProfile } from "@/queries/types";

export const lookingFor = [
  {
    id: 0,
    label: "Still figuring out",
  },
  {
    id: 1,
    label: "Dynamic Duo",
  },
  {
    id: 2,
    label: "Tech Partner",
  },
  {
    id: 3,
    label: "Short Term",
  },
  {
    id: 4,
    label: "Gonna go with flow",
  },
];

export const newData: feedUser[] = [
  {
    essentials: {
      education: "College",
      location: "xyz",
    },
    _id: "67bf5111c02a042e19d7508f",
    firstName: "Sydney",
    lastName: "Sweeny",
    dateOfBirth: "2003-10-07T00:00:00.000Z",
    about: "Hey my name is sydney Sweeny",
    gender: "female",
    lookingFor: "Dynamic Duo",
    skills: [
      {
        label: "Actor",
        _id: "67d29761b0f7069391a1ec05",
      },
      {
        label: "Model",
        _id: "67d29761b0f7069391a1ec06",
      },
    ],
    pictures: [
      {
        imgUrl:
          "https://9kxm48um1u.ufs.sh/f/YB7smbexir9WommEjJgFvOy180XuZHDGlV5eCiMbdKcYUPTz",
        _id: "67cf5bfd5569e879e506306c",
      },
      {
        imgUrl:
          "https://9kxm48um1u.ufs.sh/f/YB7smbexir9Wrept3YHB3unpQdv2mXLWZbEYFfoTg6yHOaR9",
        _id: "67cf5bfd5569e879e506306d",
      },
      {
        imgUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Sydney_Sweeney_at_the_2024_Toronto_International_Film_Festival_%28cropped%2C_rotated%29.jpg/1200px-Sydney_Sweeney_at_the_2024_Toronto_International_Film_Festival_%28cropped%2C_rotated%29.jpg",
        _id: "67d29761b0f7069391a1ec09",
      },
    ],
  },
];
