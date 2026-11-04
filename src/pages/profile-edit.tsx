import { useState, useCallback, useMemo } from "react";
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
import useAuthStore from "@/store/authStore";

const MAX_IMAGES = 5; // must match the server's pictures limit (models/user.ts)

type UpdateProfile = z.infer<typeof updateSchema>;

interface OutletContext {
  isBottomNavActive: boolean;
}

// Map a saved user to form values (used for initial values and after each save)
const toFormValues = (user: UserProfile | null | undefined): UpdateProfile => ({
  about: user?.about || "",
  dateOfBirth: user?.dateOfBirth?.split("T")[0],
  gender: user?.gender,
  education: user?.essentials?.education,
  lookingFor: user?.lookingFor,
  pictures: user?.pictures ?? [],
  skills: user?.skills ?? [],
});

const ProfileEdit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { max, min } = useMemo(() => getMinMaxDate(), []);
  const context = useOutletContext<OutletContext>();

  // Form state
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfile>({
    resolver: zodResolver(updateSchema),
    defaultValues: useMemo(() => toFormValues(user), [user]),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  // Component state
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropDown, setActiveDropDown] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("edit");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFullModePreview, setIsFullModePreview] = useState(false);
  const [previewData, setPreviewData] = useState(user);

  // Mutation
  const { mutateAsync: mutateProfile } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.patch<{ user: UserProfile }>(
        import.meta.env.VITE_API_URL + "/profile",
        payload,
        { withCredentials: true }
      );
      return res.data.user;
    },
    onSuccess: () => {
      addToast({
        title: "Profile updated successfully",
        description: "Your profile has been updated",
        color: "success",
      });
      if (context.isBottomNavActive) {
        navigate("/dashboard/profile");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Handlers
  const handleTabClick = useCallback(() => {
    const pictures = previewData?.pictures ?? [];
    setActiveSlide((prev) => (prev + 1) % pictures.length);
  }, [previewData?.pictures]);

  const toggleFullMode = useCallback(() => {
    setIsFullModePreview((prev) => !prev);
  }, []);

  const toggleTab = useCallback(
    (tab: string) => {
      if (["edit", "preview"].includes(tab)) {
        const formData = control._formValues;
        setPreviewData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...formData,
            _id: prev._id,
            firstName: prev.firstName,
            lastName: prev.lastName,
            email: prev.email,
          };
        });
        setCurrentTab(tab);
      }
    },
    [control]
  );

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setActiveDropDown(null);
  }, []);

  const onSubmit = useCallback(
    async (data: UpdateProfile) => {
      try {
        if (!isDirty) {
          navigate("/dashboard/profile");
          return;
        }

        setIsFormLoading(true);

        const pictureData =
          data.pictures?.filter((value) => typeof value.imgUrl !== "string") ??
          [];

        let uploadedImagesRes: imageUploadApiResponse | undefined;

        if (pictureData.length > 0) {
          const picturesForUpload = new FormData();
          pictureData.forEach((value) => {
            picturesForUpload.append("images", value.imgUrl);
          });

          uploadedImagesRes = (
            await axios.post<imageUploadApiResponse>(
              import.meta.env.VITE_API_URL + "/profile/upload-picture",
              picturesForUpload,
              { withCredentials: true }
            )
          ).data;
        }

        const pictures = (
          data.pictures
            ?.filter((v) => typeof v.imgUrl === "string")
            .map((picture) => ({ imgUrl: picture.imgUrl })) ?? []
        ).concat(uploadedImagesRes?.data ?? []);

        const skills = data.skills.map((sk) => ({ label: sk.label }));
        const payload = {
          ...data,
          pictures,
          skills,
          essentials: {
            education: data.education,
          },
        };

        const savedUser = await mutateProfile(payload);
        // defaultValues only apply on mount; reset to what the server saved
        reset(toFormValues(savedUser));
      } catch (error) {
        addToast({
          title: "Error updating profile",
          description: "An error occurred while updating your profile",
          color: "danger",
        });
      } finally {
        setIsFormLoading(false);
      }
    },
    [isDirty, navigate, mutateProfile, reset]
  );

  // Memoized values
  const pictures = useMemo(
    () => previewData?.pictures ?? [],
    [previewData?.pictures]
  );

  const slideImageUrl = useMemo(
    () => getSlideImage({ activeSlide, pictures }),
    [activeSlide, pictures]
  );

  if (!user) {
    return null;
  }
  return (
    <div className="w-full h-full lg:w-[24rem] lg:h-[90%] shadow-lg shadow-default-200/35 rounded-lg relative overflow-hidden select-none">
      {!isFullModePreview && context.isBottomNavActive && (
        <div className="flex justify-center items-center relative bg-secondary-100 p-2 text-center border-b border-b-secondary-50">
          <span className="text-xl font-semibold">Edit Info</span>
          <button
            onClick={handleSubmit(onSubmit)}
            className="absolute right-5 font-semibold text-sm cursor-pointer text-primary-600 hover:text-primary-300"
            aria-label="Save profile changes"
          >
            Done
          </button>
        </div>
      )}

      <form
        id="update-form"
        onSubmit={handleSubmit(onSubmit)}
        className="bg-background shadow-large lg:rounded-xl w-full h-full"
      >
        {isFormLoading ? (
          <div className="flex w-full h-full items-center justify-center bg-white/20">
            <Spinner size="lg" aria-label="Loading profile" />
          </div>
        ) : (
          <MainCard
            scrollEnable={!(currentTab === "preview") || isFullModePreview}
            cardHeader={
              isFullModePreview ? (
                <div
                  className={cn(
                    "flex sticky top-0 z-50 items-center bg-secondary-50 w-full justify-center px-2 pt-4"
                  )}
                >
                  <div className="flex py-4 justify-between w-full h-fit items-center">
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
                      className="bg-primary-300 w-7 h-7 rounded-full  aspect-square hover:scale-125 hover:bg-primary-500 transition-all transform duration-200 ease-in-out cursor-pointer flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullMode();
                      }}
                      aria-label="Exit full screen preview"
                    >
                      <Icon
                        className="text-xs rotate-180"
                        icon="icon-park-solid:up-two"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <CardHeader
                  currentTab={currentTab}
                  handleTabChange={toggleTab}
                />
              )
            }
          >
            {currentTab === "edit" ? (
              <div className="px-2.5 py-0.5 mb-24">
                <ProfilePhotoUpload MAX_IMAGES={MAX_IMAGES} control={control} />
                <EditAbout register={register} />
                <EditGoal control={control} />
                <EditSkills
                  fields={fields}
                  remove={remove}
                  setActiveDropDown={setActiveDropDown}
                  setIsOpen={setIsOpen}
                />
                <EditEssentials
                  dateOfBirth={getValues("dateOfBirth")}
                  education={getValues("education")}
                  gender={getValues("gender")}
                  setActiveDropDown={setActiveDropDown}
                  setIsOpen={setIsOpen}
                />
              </div>
            ) : (
              <div className="py-2 h-full">
                <div
                  onClick={handleTabClick}
                  className={cn(
                    isFullModePreview ? "h-[70%]" : "h-full",
                    "flex items-end bg-cover bg-no-repeat bg-center bg-black/75",
                    "w-full transition-height transform duration-300 ease-in-out rounded-lg overflow-hidden cursor-pointer"
                  )}
                  style={{ backgroundImage: `url(${slideImageUrl})` }}
                  role="button"
                  aria-label="Click to change photo"
                >
                  <div className="w-full py-[2px] px-[6px] bg-black absolute z-30 top-2 grid grid-rows-1 grid-flow-col auto-cols-auto gap-1.5">
                    {pictures.map((_, i) => {
                      const isActive = i === activeSlide;
                      return (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlide(i);
                          }}
                          className={cn(
                            "h-1 w-full rounded-lg cursor-pointer transition-all transform duration-250",
                            isActive
                              ? "bg-white"
                              : "bg-slate-400/80 hover:bg-slate-400/95"
                          )}
                          aria-label={`View photo ${i + 1}`}
                        />
                      );
                    })}
                  </div>

                  {!isFullModePreview && (
                    <div className="w-full pb-32 bg-gradient-to-b from-black/10 via-black/70 to-black">
                      <div className="p-6">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-end gap-1">
                            <h2 className="font-semibold text-3xl tracking-normal">
                              {previewData?.firstName},
                            </h2>
                            <span className="font-semibold text-xl">
                              {getAge(previewData?.dateOfBirth)}
                            </span>
                          </div>
                          <button
                            className="bg-default p-2 rounded-full hover:scale-125 hover:bg-default-300 transition-all transform duration-200 ease-in-out cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFullMode();
                            }}
                            aria-label="Enter full screen preview"
                          >
                            <Icon
                              className="w-3.5 h-3.5"
                              icon="icon-park-solid:up-two"
                            />
                          </button>
                        </div>
                        <SlideDescription
                          about={previewData?.about}
                          activeSlide={activeSlide}
                          education={previewData?.essentials?.education}
                          gender={previewData?.gender}
                          lookingFor={previewData?.lookingFor}
                          skills={previewData?.skills ?? []}
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
                      dateOfBirth={user.dateOfBirth}
                      education={getValues("education")}
                      gender={getValues("gender")}
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
          onClick={closeDrawer}
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
                        aria-label="Select your date of birth"
                        aria-labelledby="Select your date of birth"
                      />
                    );
                  }}
                />
                {errors.dateOfBirth && (
                  <span className="text-xs text-danger">
                    {errors.dateOfBirth.message}
                  </span>
                )}
                <Button
                  variant="flat"
                  color={!errors.dateOfBirth ? "primary" : "danger"}
                  onPress={() => {
                    if (errors.dateOfBirth) return;
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
                    <ul
                      className="grid w-full gap-2 grid-rows-3"
                      role="radiogroup"
                      aria-label="Select your gender"
                    >
                      {["male", "female", "other"].map((g) => (
                        <li key={g}>
                          <input
                            type="radio"
                            id={g}
                            {...field}
                            value={g}
                            checked={field.value === g}
                            className="hidden peer"
                            aria-label={`Select ${g} as gender`}
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
                <Button color="primary" variant="flat" onPress={closeDrawer}>
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

            {activeDropDown === "education" && (
              <div className="flex flex-col items-center p-4 gap-2">
                <h2 className="font-semibold">Enter Your Highest Education</h2>
                <Input
                  {...register("education")}
                  className="w-full border-secondary"
                  title="Education Information"
                  aria-label="Enter your highest education level"
                  variant="bordered"
                  classNames={{
                    input: "border-secondary text-base",
                    mainWrapper: "border-secondary",
                  }}
                />
                <Button
                  onPress={() => setIsOpen(false)}
                  variant="flat"
                  color="primary"
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
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
