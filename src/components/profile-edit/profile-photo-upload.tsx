import { cn } from "@/utils/helpers";
import { updateSchema } from "@/utils/validation-schema";
import { Icon } from "@iconify/react";
import * as z from "zod";
import { Control, useFieldArray } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { nanoid } from "nanoid";

type updateProfile = z.infer<typeof updateSchema>;

const ProfilePhotoUpload = ({
  control,
  MAX_IMAGES,
}: {
  control: Control<updateProfile>;
  MAX_IMAGES: number;
}) => {
  const {
    fields: pictureFields,
    append: appendPicture,
    remove: removePicture,
  } = useFieldArray<updateProfile, "pictures", "_id">({
    name: "pictures",
    control,
    keyName: "_id",
  });
  const onDrop = useCallback(
    (droppedFiles: File[]) => {
      const newPics = droppedFiles.map((file) => {
        return { _id: nanoid(6), imgUrl: file };
      });
      appendPicture(newPics);
    },
    [appendPicture] // Ensure appendPicture is in the dependency array
  );
  const { getInputProps, getRootProps } = useDropzone({
    maxFiles: MAX_IMAGES - pictureFields.length,
    accept: { "image/*": [] },
    onDrop,
    multiple: true,
  });
  return (
    <div>
      <h2 className="font-semibold my-2">PROFILE PHOTO</h2>
      <div className="grid grid-rows-2 grid-cols-3 w-full h-96 lg:h-60 gap-2">
        {pictureFields.map(({ _id, imgUrl }, index) => {
          // console.log(imgUrl);
          return (
            <div
              key={_id}
              className={cn(
                "bg-secondary-50 rounded-lg relative border-transparent"
              )}
            >
              <img
                src={
                  imgUrl instanceof File ? URL.createObjectURL(imgUrl) : imgUrl
                }
                className="w-full h-full object-cover object-center rounded-lg"
                alt="profile-picture"
              />
              <span
                onClick={() => {
                  removePicture(index);
                }}
                className={cn(
                  "bg-white text-slate-600",
                  "absolute rounded-full -bottom-1.5 -right-1 aspect-square p-0.5 cursor-pointer"
                )}
              >
                <Icon
                  icon={"line-md:plus"}
                  className="w-3.5 h-3.5 aspect-square rotate-45"
                />
              </span>
            </div>
          );
        })}
        {Array.from({
          length: MAX_IMAGES - pictureFields.length,
        }).map((_, i) => (
          <div
            key={pictureFields.length - i}
            {...getRootProps()}
            className="bg-secondary-50 rounded-lg relative border-dashed border-3 border-primary-50 cursor-pointer"
          >
            <input
              type="file"
              {...getInputProps()}
              className="w-full h-full cursor-pointer"
            />
            <span
              className={cn(
                "bg-red-500",
                "absolute rounded-full -bottom-1.5 -right-2 p-1 cursor-pointer"
              )}
            >
              <Icon
                icon={"line-md:plus"}
                className="w-3.5 h-3.5 aspect-square"
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
