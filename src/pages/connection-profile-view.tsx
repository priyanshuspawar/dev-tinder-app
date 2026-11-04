import { ConnectionRequests, UserProfile } from "@/queries/types";
import { cn, getAge, getSlideImage } from "@/utils/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState } from "react";
import EditGoal from "@/components/profile-edit/edit-goal";
import EditEssentials from "@/components/profile-edit/edit-essentials";
import EditAbout from "@/components/profile-edit/edit-about";
import { EditSkills } from "@/components/profile-edit/edit-skills";
import { SlideDescription } from "@/components/feed-card";
const ConnectionProfileView = () => {
  const { id: userId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const connectionRequests = queryClient.getQueryData([
    "request-received",
  ]) as ConnectionRequests;
  const [requestUser] = connectionRequests.filter(
    (connection) => connection.fromUserId._id === userId
  );
  const user = queryClient.getQueryData(["user"]) as UserProfile;
  const userSkills = user.skills.map((v) => v.label);
  const {
    firstName,
    dateOfBirth,
    pictures,
    about,
    essentials,
    skills,
    gender,
    lookingFor,
  } = requestUser.fromUserId;
  const { isButtomNavActive } = useOutletContext<{
    isFullModeActive: boolean;
    isButtomNavActive: boolean;
  }>();
  const navigation = useNavigate();
  if (isButtomNavActive) {
    navigation("/dashboard", {
      replace: true,
    });
  }
  const [isFullModeActive, setIsFullModeActive] = useState(true);
  const toggleFullMode = () => {
    setIsFullModeActive(!isFullModeActive);
  };
  const [activeSlide, setActiveSlide] = useState(0);
  const handleTabClick = () => {
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
