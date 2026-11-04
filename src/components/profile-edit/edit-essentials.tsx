import { cn, distanceLabel, getAge } from "@/utils/helpers";
import { Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import useAuthStore from "@/store/authStore";
const EditEssentials = ({
  setActiveDropDown,
  setIsOpen,
  dateOfBirth,
  gender,
  education,
  location,
  isReadyOnly = false,
  selfView = false,
}: {
  setActiveDropDown?: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  dateOfBirth: string | undefined | null;
  gender: "male" | "female" | "other" | undefined;
  education: string | null | undefined;
  location?: { coordinates?: [number, number] }; // the other person's location
  isReadyOnly?: boolean;
  selfView?: boolean;
}) => {
  const { user } = useAuthStore();
  const distance = selfView
    ? null
    : distanceLabel(user?.essentials?.location?.coordinates, location?.coordinates);
  const handleOpenDropdown = (panelName: string) => {
    if (!setActiveDropDown || !setIsOpen) return;
    setActiveDropDown(panelName);
    setIsOpen(true);
  };

  {
    /* ESSENTIALS */
  }
  return (
    <>
      {isReadyOnly ? (
        <>
          {(education || gender) && (
            <div className="bg-secondary-50 w-full py-4 px-4 flex flex-col rounded-2xl overflow-hidden">
              <span className="flex gap-2 items-center font-semibold leading-none text-gray-300 text-sm md:text-base mb-1">
                <Icon icon={"material-symbols:account-box"} />
                <span>Essentials</span>
              </span>

              <span className="flex flex-col my-2">
                {gender && (
                  <div className="flex items-center gap-2 text-xs md:text-sm ">
                    <Icon icon={"icons8:gender"} className="" />
                    <span className="capitalize">{gender}</span>
                  </div>
                )}
                {education && (
                  <>
                    <Divider className="my-1" />

                    <div className="flex items-center gap-2 text-xs md:text-sm ">
                      <Icon icon={"lsicon:education-outline"} className="" />
                      <span className="capitalize">{education}</span>
                    </div>
                  </>
                )}
                {distance && (
                  <>
                    <Divider className="my-1" />
                    <div className="flex items-center gap-2 text-xs md:text-sm ">
                      <Icon icon={"tabler:location"} className="" />
                      <span>{distance}</span>
                    </div>
                  </>
                )}
              </span>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2 className="font-semibold my-2">ESSENTIALS</h2>
          {/* Date of Birth */}
          <div
            className="bg-secondary-50 cursor-pointer rounded-t-lg py-2 px-2 flex justify-between items-center group"
            onClick={() => {
              handleOpenDropdown("dateOfBirth");
            }}
          >
            <span className="text-foreground-100 group-hover:text-primary-500 text-sm font-semibold transition-colors">
              Date of Birth
            </span>
            <span
              className={cn(
                { underline: !dateOfBirth },
                "text-foreground-300 text-sm group-hover:text-secondary-500"
              )}
            >
              {getAge(dateOfBirth) || "Enter"}
            </span>
          </div>
          <Divider />
          {/* Gender */}
          <div
            onClick={() => {
              handleOpenDropdown("gender");
            }}
            className="bg-secondary-50 cursor-pointer py-2 px-2 flex justify-between items-center group"
          >
            <span className="text-foreground-100 group-hover:text-primary-500 text-sm font-semibold transition-colors">
              Gender
            </span>
            <span
              className={cn(
                { underline: !gender },
                "text-foreground-300 text-sm group-hover:text-secondary-500 capitalize"
              )}
            >
              {gender || "Enter"}
            </span>
          </div>
          <Divider />
          {/* Education */}
          <div
            onClick={() => {
              handleOpenDropdown("education");
            }}
            className="bg-secondary-50 cursor-pointer py-2 px-2 flex justify-between items-center group"
          >
            <span className="text-foreground-100 group-hover:text-primary-500 text-sm font-semibold transition-colors">
              Education
            </span>
            <span
              className={cn(
                { underline: !education },
                "text-foreground-300 text-sm group-hover:text-secondary-500"
              )}
            >
              {education || "Enter"}
            </span>
          </div>
          <Divider />
        </div>
      )}
    </>
  );
};

export default EditEssentials;
