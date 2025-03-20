import { UserProfile } from "@/queries/types";
import { getAge, getProfilePhoto } from "@/utils/helpers";
import { Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]) as UserProfile;
  const navigation = useNavigate();
  return (
    <div className="flex flex-col items-center overflow-hidden">
      <div className="w-[48rem] sm:w-[60rem] md:w-[66rem] px-10 h-fit py-16 rounded-b-[20rem] sm:rounded-b-[30rem] md:rounded-b-[48rem] bg-secondary-50">
        <div className="flex flex-col items-center">
          <Avatar
            className="w-36 h-36"
            src={getProfilePhoto(user.pictures)}
            showFallback={true}
            alt="profile photo"
          />
          <h2 className="text-2xl font-medium">
            {user?.firstName}
            <span className="text-xl">
              {user?.dateOfBirth ? ", " + getAge(user.dateOfBirth) : ""}
            </span>
          </h2>
        </div>
        <div className="flex justify-center gap-32 my-2 sm:my-4 md:my-6">
          <div
            onClick={() => {
              navigation("/dashboard/profile/edit");
            }}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="flex w-fit flex-col bg-secondary-200 border-1 border-white/60 p-3 rounded-full">
              <Icon icon={"ic:round-edit"} className="text-2xl" />
            </span>
            <span className="font-semibold text-xs">Edit Profile</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <span className="flex w-fit flex-col bg-secondary-200 border-1 border-white/60 p-3 rounded-full">
              <Icon icon={"mdi:settings"} className="text-2xl" />
            </span>
            <span className="font-semibold text-xs">Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
