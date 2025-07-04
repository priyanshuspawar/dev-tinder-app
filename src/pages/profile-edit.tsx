import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import MainCard from "@/components/main-card";
import {
  cn,
  getAge,
  getMinMaxDate,
  getSlideImage,
  isValidDate,
} from "@/utils/helpers";
import { parseDate } from "@internationalized/date";
import * as z from "zod";
import { DatePicker, Button, Input, Spinner, addToast } from "@heroui/react";
import { updateSchema } from "@/utils/validation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { imageUploadApiResponse, UserProfile } from "@/queries/types";
import CardHeader from "@/components/profile-edit/CardHeader";
import ProfilePhotoUpload from "@/components/profile-edit/profile-photo-upload";
import EditAbout from "@/components/profile-edit/edit-about";
import EditGoal from "@/components/profile-edit/edit-goal";
import {
  EditSkills,
  EditSkillsDropdown,
} from "@/components/profile-edit/edit-skills";
import EditEssentials from "@/components/profile-edit/edit-essentials";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SlideDescription } from "@/components/feed-card";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const MAX_IMAGES = 6;

type updateProfile = z.infer<typeof updateSchema>;

const ProfileEdit = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["user"]) as UserProfile;
  const { max, min } = getMinMaxDate();
  // Initialize React Hook Form with default values from the user
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors, isDirty },
  } = useForm<updateProfile>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      about: user?.about || "",
      dateOfBirth: user?.dateOfBirth?.split("T")[0],
      gender: user?.gender,
      location: user?.essentials?.location,
      education: user?.essentials?.education,
      lookingFor: user?.lookingFor,
      pictures: user?.pictures ?? [],
      skills: user?.skills ?? [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills", // Name of the field array
  });
  const [isFormLoading, setIsFormLoading] = useState(false);
  const navigation = useNavigate();
  // Submit handler – converts dateOfBirth and sends the payload to your API.
  const { mutateAsync: mutateProfile } = useMutation({
    mutationFn: async (payload: any) => {
      await axios.patch(import.meta.env.VITE_API_URL + "/profile", payload, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      addToast({
        title: "Profile updated successfully",
        description: "Your profile has been updated",
        color: "success",
      });
      if (context.isBottomNavActive) {
        navigation("/dashboard/profile");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  const onSubmit = async (data: updateProfile) => {
    try {
      if (!isDirty) {
        navigation("/dashboard/profile");

        return;
      }
      setIsFormLoading(true);
      let pictureData =
        data.pictures?.filter((value) => typeof value.imgUrl !== "string") ??
        [];
      let uploadedImagesRes: imageUploadApiResponse | undefined;
      if (pictureData?.length > 0) {
        const picturesForUpload = new FormData();

        pictureData.forEach((value) => {
          picturesForUpload.append("images", value.imgUrl); // Append each file
        });

        uploadedImagesRes = (
          await axios.post<imageUploadApiResponse>(
            import.meta.env.VITE_API_URL + "/profile/upload-picture",
            picturesForUpload,
            {
              withCredentials: true,
            }
          )
        ).data;
      }

      const pictures = (
        data.pictures
          ?.filter((v) => typeof v.imgUrl == "string")
          .map((picture) => {
            return { imgUrl: picture.imgUrl };
          }) ?? []
      ).concat(uploadedImagesRes?.data ?? []);
      const skills = data.skills.map((sk) => ({ label: sk.label }));
      const payload = {
        ...data,
        pictures,
        skills,
        essentials: {
          location: data.location,
          education: data.education,
        },
      };

      await mutateProfile(payload);
      reset();
    } catch (error) {
      addToast({
        title: "Error updating profile",
        description: "An error occurred while updating your profile",
        color: "danger",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  // Drawer state to control which field’s editor is open
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropDown, setActiveDropDown] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("edit");
  const [previewData, setPreviewData] = useState(user);
  const toggleTab = (tab: string) => {
    const formData = control._formValues;
    if (["edit", "preview"].includes(tab)) {
      setPreviewData((prev) => ({ ...prev, ...formData }));
      setCurrentTab(tab);
    }
  };
  const context = useOutletContext<{
    isBottomNavActive: boolean;
  }>();

  //handlers for preview tab
  const pictures = previewData.pictures ?? [];
  const [activeSlide, setActiveSlide] = useState(0);
  const handleTabClick = () => {
    setActiveSlide((activeSlide + 1) % pictures.length);
  };
  const [isFullModePreview, setisFullModePreview] = useState(false);
  const toggleFullMode = () => {
    setisFullModePreview(!isFullModePreview);
  };
  if (!user) {
    return;
  }
  return (
    <div
      className="
    w-full h-full lg:w-[24rem] lg:h-[90%] shadow-lg shadow-default-200/35 rounded-lg
    relative overflow-hidden select-none"
    >
      {!isFullModePreview && context.isBottomNavActive && (
        <div className="flex justify-center items-center relative bg-secondary-100 p-2 text-center ">
          <span className="text-xl font-semibold">Edit Info</span>
          <button
            onClick={handleSubmit(onSubmit)}
            className="absolute right-5 font-semibold text-sm cursor-pointer text-primary-600 hover:text-primary-300"
          >
            Done
          </button>
        </div>
      )}
      <form
        id="update-form"
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background shadow-large lg:rounded-xl w-full h-full overflow-hidden"
      >
        {isFormLoading ? (
          <div className="flex w-full h-full items-center justify-center bg-white/20">
            <Spinner size="lg" />
          </div>
        ) : (
          <MainCard
            scrollEnable={!(currentTab === "preview") || isFullModePreview}
            cardHeader={
              isFullModePreview ? (
                <div
                  className={cn(
                    "flex sticky top-0 z-50",
                    "justify-between items-center bg-secondary-50 w-full py-3 px-4"
                  )}
                >
                  <div>
                    <span className="text-2xl tracking-wide font-semibold">
                      {user.firstName}
                    </span>
                    <span className="text-lg font-medium text-gray-100 whitespace-pre">
                      {"  "}
                      {getAge(user.dateOfBirth)}
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
              ) : (
                <CardHeader
                  currentTab={currentTab}
                  handleTabChange={(e) => {
                    toggleTab(e);
                  }}
                />
              )
            }
          >
            {currentTab == "edit" ? (
              <div className="px-2.5 py-0.5">
                {/* PROFILE PHOTO */}
                <ProfilePhotoUpload MAX_IMAGES={MAX_IMAGES} control={control} />
                {/* ABOUT */}
                <EditAbout register={register} />
                {/* RELATION GOALS */}
                <EditGoal control={control} />
                {/* SKILLS */}
                <EditSkills
                  fields={fields}
                  remove={remove}
                  setActiveDropDown={setActiveDropDown}
                  setIsOpen={setIsOpen}
                />
                {/* ESSENTIALS */}
                <EditEssentials
                  dateOfBirth={getValues("dateOfBirth")}
                  education={getValues("education")}
                  gender={getValues("gender")}
                  location={getValues("location")}
                  setActiveDropDown={setActiveDropDown}
                  setIsOpen={setIsOpen}
                />
              </div>
            ) : (
              <div className="py-2 h-full">
                <div
                  onClick={() => {
                    handleTabClick();
                  }}
                  className={cn(
                    isFullModePreview ? "h-[70%]" : "h-full",
                    "flex items-end bg-cover bg-no-repeat bg-center bg-black/75",
                    "w-full transition-height transform duration-300 ease-in-out rounded-lg overflow-hidden"
                  )}
                  style={{
                    backgroundImage: `url(${getSlideImage({ activeSlide, pictures })})`,
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
                  {!isFullModePreview && (
                    <div className="w-full bg-gradient-to-t from-black via-black/80 to-black/0 pt-2">
                      {/* infos */}
                      <div className={cn("p-6")}>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-end gap-1">
                            <h2 className="font-semibold text-3xl tracking-normal">
                              {previewData.firstName},
                            </h2>
                            <span className="font-semibold text-xl">
                              {getAge(previewData.dateOfBirth)}
                            </span>
                          </div>

                          <div
                            className="bg-default p-2 rounded-full hover:scale-125 hover:bg-default-300 transition-all transform duration-200 ease-in-out cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFullMode();
                            }}
                          >
                            <Icon
                              className="w-3.5 h-3.5"
                              icon={"icon-park-solid:up-two"}
                            />
                          </div>
                        </div>

                        <SlideDescription
                          about={previewData?.about}
                          activeSlide={activeSlide}
                          education={previewData.essentials?.education}
                          location={previewData.essentials?.location}
                          gender={previewData?.gender}
                          lookingFor={previewData?.lookingFor}
                          skills={previewData?.skills}
                          userSkills={[]}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isFullModePreview && (
                  <div className="mt-2 mb-20 px-2 flex flex-col gap-2">
                    <EditGoal value={user.lookingFor} isReadOnly />
                    <EditEssentials
                      isReadyOnly
                      {...{
                        dateOfBirth: user.dateOfBirth,
                        education: getValues("education"),
                        gender: getValues("gender"),
                        location: getValues("location"),
                      }}
                    />
                    <EditAbout value={user.about} isReadOnly />
                    <EditSkills
                      skills={user.skills}
                      isReadOnly
                      userSkills={[]}
                    />
                  </div>
                )}
              </div>
            )}
          </MainCard>
        )}

        {/* Drawer for editing individual fields */}
        <div
          className={cn(
            "absolute inset-0 bg-black/55 z-40 transition-opacity duration-500 ease-in-out",
            {
              "opacity-100 pointer-events-auto": isOpen,
              "opacity-0 pointer-events-none": !isOpen,
            }
          )}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-secondary-50 rounded-t-lg shadow-lg transform transition-transform duration-500 ease-in-out h-fit w-full",
              { "translate-y-0": isOpen, "translate-y-full": !isOpen }
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {activeDropDown === "dateOfBirth" && (
              <div className="flex flex-col items-center p-4 gap-2">
                <h2 className="font-semibold">Enter Your Date of Birth</h2>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    // Convert form value to CalendarDate
                    const value = field.value
                      ? parseDate(field.value.split("T")[0])
                      : undefined;

                    return (
                      <DatePicker
                        {...field}
                        classNames={{
                          base: "border-secondary-100 data-[hover=true]:border-secondary-200",
                        }}
                        className="max-w-[284px]"
                        variant="bordered"
                        minValue={parseDate(min) as any}
                        maxValue={parseDate(max) as any}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        value={(value as any) ?? null}
                        onChange={(value) => {
                          field.onChange(value?.toString() ?? null);
                          if (!isValidDate(value?.toString() ?? "")) {
                            setError("dateOfBirth", {
                              message: "Invalid birth date",
                            });
                          } else {
                            clearErrors("dateOfBirth");
                          }
                        }}
                      />
                    );
                  }}
                />
                {errors.dateOfBirth && (
                  <span className="text-xs text-danger">{`${errors?.dateOfBirth.message}`}</span>
                )}
                <Button
                  variant="bordered"
                  color={!errors.dateOfBirth ? "default" : "danger"}
                  onPress={() => {
                    if (errors.dateOfBirth) {
                      return;
                    }
                    setIsOpen(false);
                  }}
                >
                  Done
                </Button>
              </div>
            )}

            {activeDropDown === "gender" && (
              <div className="flex flex-col items-center p-4 gap-2">
                <h2 className="font-semibold">Enter Your Gender</h2>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <ul className="grid w-full gap-2 grid-rows-3">
                      {["male", "female", "other"].map((g) => (
                        <li key={g}>
                          <input
                            type="radio"
                            id={g}
                            {...field}
                            value={g}
                            checked={field.value === g}
                            className="hidden peer"
                          />
                          <label
                            htmlFor={g}
                            className="transition-colors duration-400 ease-in-out inline-flex items-center justify-between w-full p-2 text-foreground border border-secondary-100 rounded-lg cursor-pointer hover:text-foreground-300 hover:bg-secondary-200 peer-checked:border-primary peer-checked:text-primary-600"
                            onClick={() => field.onChange(g)}
                          >
                            <div className="block font-semibold">
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </div>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                />
                <Button
                  onPress={() => {
                    setIsOpen(false);
                    setActiveDropDown(null);
                  }}
                >
                  Done
                </Button>
              </div>
            )}

            {activeDropDown === "add-skills" && (
              <EditSkillsDropdown
                append={append}
                setActiveDropDown={setActiveDropDown}
                setIsOpen={setIsOpen}
              />
            )}

            {activeDropDown === "location" && (
              <div className="flex flex-col items-center p-4 gap-2">
                <h2 className="font-semibold">Enter Your Location</h2>
                <Input
                  {...register("location")}
                  className="w-full"
                  label={"Location"}
                />
                <Button onPress={() => setIsOpen(false)}>Save</Button>
              </div>
            )}

            {activeDropDown === "education" && (
              <div className="flex flex-col items-center p-4 gap-2">
                <h2 className="font-semibold">Enter Your Highest Education</h2>
                <Input
                  {...register("education")}
                  className="w-full"
                  title="Education Information"
                />
                <Button onPress={() => setIsOpen(false)}>Save</Button>
              </div>
            )}
          </div>
        </div>
        {/* submit button */}
        {!context.isBottomNavActive && (
          <span className="w-full flex justify-center">
            <Button
              color="primary"
              type="submit"
              variant="shadow"
              radius="full"
              disabled={isFormLoading}
              className="font-semibold tracking-normal text-lg"
            >
              Save
            </Button>
          </span>
        )}
      </form>
    </div>
  );
};

export default ProfileEdit;
