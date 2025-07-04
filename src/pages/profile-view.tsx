import EditAbout from "@/components/profile-edit/edit-about";
import EditEssentials from "@/components/profile-edit/edit-essentials";
import EditGoal from "@/components/profile-edit/edit-goal";
import { EditSkills } from "@/components/profile-edit/edit-skills";
import { UserProfile } from "@/queries/types";
import useAuthStore from "@/store/authStore";
import { getAge, getProfilePhoto } from "@/utils/helpers";
import { Avatar, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const navigation = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const handleTabClick = () => {
    setActiveSlide((activeSlide + 1) % pictures.length);
  };
  if (!user) return;
  const {
    firstName,
    dateOfBirth,
    pictures,
    lookingFor,
    essentials,
    gender,
    about,
    skills,
  } = user;
  return (
    <div className="flex flex-col items-center overflow-hidden w-full h-full lg:justify-center">
      <div className="w-[48rem] sm:w-[60rem] md:w-[66rem] lg:hidden px-10 h-fit py-16 rounded-b-[20rem] sm:rounded-b-[30rem] md:rounded-b-[48rem] bg-secondary-50">
        <div className="flex flex-col items-center">
          <Avatar
            className="w-36 h-36"
            src={getProfilePhoto(pictures)}
            showFallback={true}
            alt="profile photo"
          />
          <h2 className="text-2xl font-medium">
            {firstName}
            <span className="text-xl">
              {dateOfBirth ? ", " + getAge(dateOfBirth) : ""}
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
      <div className="hidden lg:flex flex-col w-[24rem] mx-auto h-[90%] overflow-y-scroll scrollbar-hide rounded-lg shadow-lg shadow-default-200/35 items-center">
        {/* header */}
        <div
          className={cn(
            // isFullModeActive ? "flex sticky top-0 z-50" : "hidden",
            "justify-between items-center bg-secondary-50 w-full py-3 px-4"
          )}
        >
          {/* header */}
          <div>
            <span className="text-2xl tracking-wide font-semibold">
              {firstName}
            </span>
            <span className="text-lg font-medium text-gray-100 whitespace-pre">
              {"  "}
              {getAge(dateOfBirth)}
            </span>
          </div>
        </div>
        {/* photo */}
        <div
          onClick={() => {
            handleTabClick();
          }}
          className={cn(
            "bg-cover bg-no-repeat bg-center bg-black/75 aspect-[9/10] w-full h-fit transition-height transform duration-300 ease-in-out"
          )}
          style={{ backgroundImage: `url(${pictures[activeSlide]?.imgUrl})` }}
        >
          <div className="w-full py-[2px] px-[6px] bg-black absolute z-30 top-2 grid grid-rows-1 grid-flow-col auto-cols-auto gap-1.5">
            {pictures.map((_, i) => {
              const isActive = i == activeSlide;
              return (
                <span
                  key={i}
                  onClick={() => {
                    setActiveSlide(i);
                  }}
                  className={cn(
                    "h-1 w-full rounded-lg cursor-pointer transition-all transform duration-250",
                    isActive
                      ? "bg-white"
                      : "bg-slate-400/80 hover:bg-slate-400/95"
                  )}
                />
              );
            })}
          </div>
        </div>
        {/* infos */}
        <div className="mt-2 mb-20 px-2 bg-background flex flex-col gap-2 w-full">
          <EditGoal value={lookingFor} isReadOnly />
          <EditEssentials
            isReadyOnly
            {...{
              dateOfBirth,
              education: essentials?.education,
              gender,
              location: essentials?.location,
            }}
          />
          <EditAbout value={about} isReadOnly />
          <EditSkills skills={skills} isReadOnly />
        </div>
        {/* action btn */}
        <div className="absolute bottom-12">
          <Link to={"edit"}>
            <button className="bg-gradient-to-r from-primary to-primary-200 border-none px-8 py-2 text-xl rounded-3xl font-semibold">
              Edit info 💖
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
