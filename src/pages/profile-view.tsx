import EditAbout from "@/components/profile-edit/edit-about";
import EditEssentials from "@/components/profile-edit/edit-essentials";
import EditGoal from "@/components/profile-edit/edit-goal";
import { EditSkills } from "@/components/profile-edit/edit-skills";
import useAuthStore from "@/store/authStore";
import { getAge, getProfilePhoto } from "@/utils/helpers";
import { Avatar, Badge, Button, Card, cn } from "@heroui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Heart, Pencil, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfileCompletionStatus } from "@/queries/profile";
import clsx from "clsx";
const ProfilePage = () => {
  const { data: percentage } = useQuery({
    queryKey: ["profile-completion"],
    queryFn: getProfileCompletionStatus,
  });
  const { user } = useAuthStore();
  const navigation = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const handleTabClick = () => {
    setActiveSlide((activeSlide + 1) % pictures.length);
  };
  if (!user || !percentage) return;
  const {
    firstName,
    lastName,
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
      <div className="lg:hidden flex flex-col w-full px-6 gap-4 py-20">
        <div className="flex flex-col items-center gap-2">
          <Avatar src={getProfilePhoto(pictures)} className="w-32 h-32" />

          <label htmlFor="avatar" className="text-xl font-semibold">
            {firstName + " " + (lastName ?? "")}
          </label>
          <Card
            className={clsx(
              "rounded-full text-sm p-2",
              percentage >= 65
                ? "bg-success-400"
                : percentage < 30
                  ? "bg-danger-400"
                  : "bg-warning-400"
            )}
          >
            Profile Complete {percentage} %
          </Card>
        </div>
        {/* edit profile */}
        <Card
          className="py-4 flex flex-row gap-2 px-2 items-center bg-gradient-to-br from-secondary-50 to-secondary-400"
          shadow="md"
          isHoverable
          isPressable
          onPress={() => {
            navigation("/dashboard/profile/edit");
          }}
        >
          <Button isIconOnly radius="full" size="md" color="secondary">
            <Pencil className="w-5 h-5" />
          </Button>
          <div className="w-full flex flex-col items-start">
            <label className="font-semibold">Edit profile</label>
            <p className="text-xs text-default-700">
              Update your photos and info
            </p>
          </div>
          <ChevronRight />
        </Card>
        <Card
          className="py-4 flex flex-row gap-2 px-2 items-center bg-gradient-to-br from-primary-50 to-primary-400"
          shadow="md"
          isHoverable
          isPressable
          onPress={() => {
            navigation("/dashboard/profile/settings");
          }}
        >
          <Button isIconOnly radius="full" size="md" color="primary">
            <Settings className="w-5 h-5" />
          </Button>
          <div className="w-full flex flex-col items-start">
            <label className="font-semibold">Settings</label>
            <p className="text-xs text-default-700">
              Privacy, notifications & more
            </p>
          </div>
          <ChevronRight />
        </Card>
        <Card
          className="py-4 flex flex-row gap-2 px-2 items-center bg-gradient-to-br from-default-50 to-default-200"
          shadow="md"
          isHoverable
          isPressable
        >
          <Button isIconOnly radius="full" size="md" color="danger">
            <Heart className="w-5 h-5" />
          </Button>
          <div className="w-full flex flex-col items-start">
            <label className="font-semibold">Premium</label>
            <p className="text-xs text-default-700">
              Get more matches & features
            </p>
          </div>
          <ChevronRight />
        </Card>
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
