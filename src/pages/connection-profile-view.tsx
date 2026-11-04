import { cn, getAge, getSlideImage } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Spinner } from "@heroui/react";
import EditGoal from "@/components/profile-edit/edit-goal";
import EditEssentials from "@/components/profile-edit/edit-essentials";
import EditAbout from "@/components/profile-edit/edit-about";
import { EditSkills } from "@/components/profile-edit/edit-skills";
import { SlideDescription } from "@/components/feed-card";
import { getRequestsReceived } from "@/queries/profile";
import useAuthStore from "@/store/authStore";

const ConnectionProfileView = () => {
  const { id: userId } = useParams<{ id: string }>();
  // subscribe (not getQueryData): works on refresh and reacts to accept/reject
  const { data: connectionRequests, isPending } = useQuery({
    queryKey: ["request-received"],
    queryFn: getRequestsReceived,
  });
  const { user } = useAuthStore();
  const { isBottomNavActive } = useOutletContext<{
    isFullModeActive: boolean;
    isBottomNavActive: boolean;
  }>();
  const [isFullModeActive, setIsFullModeActive] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // desktop-only page; mobile reviews requests on its own screen
  if (isBottomNavActive) {
    return <Navigate to="/dashboard/connections/review" replace />;
  }
  if (isPending) {
    return <Spinner />;
  }
  const requestUser = connectionRequests?.find(
    (request) => request.fromUserId._id === userId
  )?.fromUserId;
  if (!requestUser) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-default-500">This request is no longer pending.</p>
        <Link to="/dashboard" className="text-primary-500 font-semibold">
          Back to matching
        </Link>
      </div>
    );
  }

  const userSkills = user?.skills.map((v) => v.label);
  const {
    firstName,
    dateOfBirth,
    pictures,
    about,
    essentials,
    skills,
    gender,
    lookingFor,
  } = requestUser;
  const toggleFullMode = () => {
    setIsFullModeActive(!isFullModeActive);
  };
  const handleTabClick = () => {
    if (pictures.length === 0) return;
    setActiveSlide((activeSlide + 1) % pictures.length);
  };

  return (
    <div className="w-[20rem] lg:w-[22rem] xl:w-[22rem] 2xl:w-[23rem] h-[90%] bg-secondary-50 overflow-y-scroll scrollbar-hide relative overflow-x-hidden rounded-lg">
      <div
        className={cn(
          isFullModeActive ? "flex sticky top-0 z-50" : "hidden",
          "justify-between items-center bg-secondary-50 w-full py-3 px-4"
        )}
      >
        <div>
          <span className="text-2xl tracking-wide font-semibold">
            {firstName}
          </span>
          <span className="text-lg font-medium text-gray-100 whitespace-pre">
            {"  "}
            {getAge(dateOfBirth)}
          </span>
        </div>
        <button
          className="bg-primary-300 p-2 rounded-full hover:scale-125 hover:bg-primary-500 transition-all transform duration-200 ease-in-out cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullMode();
          }}
        >
          <Icon
            className="text-xs rotate-180"
            icon={"icon-park-solid:up-two"}
          />
        </button>
      </div>
      {/* photo */}
      <div
        onClick={() => {
          handleTabClick();
        }}
        className={cn(
          isFullModeActive
            ? "h-1/2 bg-cover bg-no-repeat bg-center bg-black/75"
            : "h-full bg-center bg-cover bg-default gradient-mask-b-40",
          "w-full transition-height transform duration-300 ease-in-out"
        )}
        style={{
          backgroundImage: `url(${getSlideImage({ pictures, activeSlide })})`,
        }}
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

      {isFullModeActive && (
        <div className="mt-2 mb-5 px-2 flex flex-col">
          <EditGoal value={lookingFor} isReadOnly />
          <EditEssentials
            isReadyOnly
            {...{
              dateOfBirth,
              education: essentials.education,
              gender,
              location: essentials.location,
            }}
          />
          <EditAbout value={about} isReadOnly />
          <EditSkills skills={skills} isReadOnly userSkills={userSkills} />
        </div>
      )}

      <div
        className={cn(
          isFullModeActive &&
            "opacity-0 transition-opacity duration-250 ease-in-out",
          "p-6 absolute bottom-5 w-full"
        )}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-end gap-1">
            <h2 className="font-semibold text-3xl tracking-normal">
              {firstName},
            </h2>
            <span className="font-semibold text-xl">{getAge(dateOfBirth)}</span>
          </div>

          <button
            className="bg-default p-2.5 rounded-full hover:scale-125 hover:bg-default-300 transition-all transform duration-200 ease-in-out cursor-pointer"
            onClick={toggleFullMode}
          >
            <Icon
              className="text-sm text-white"
              icon={"icon-park-solid:up-two"}
            />
          </button>
        </div>

        <SlideDescription
          about={about}
          activeSlide={activeSlide}
          education={essentials.education}
          location={essentials.location?.coordinates}
          gender={gender}
          lookingFor={lookingFor}
          skills={skills}
          userSkills={userSkills}
        />
      </div>
    </div>
  );
};

export default ConnectionProfileView;
