import { UpdateProfile } from "@/queries/types";
import { Icon } from "@iconify/react";
import { Textarea } from "@heroui/react";
import { UseFormRegister } from "react-hook-form";

const EditAbout = ({
  register,
  isReadOnly = false,
  value,
  firstName = "",
}: {
  register?: UseFormRegister<UpdateProfile>;
  isReadOnly?: boolean;
  value?: string;
  firstName?: string;
}) => {
  if (isReadOnly) {
    return (
      <>
        {value && (
          <div className="bg-secondary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden ">
            <span className="flex gap-1 items-center font-semibold text-gray-200 text-sm md:text-base">
              <Icon icon={"gridicons:quote"} className="w-4 h-4" />
              About me
            </span>
            <span className="items-center my-1 text-xs md:text-sm">
              {value}
            </span>
          </div>
        )}
      </>
    );
  }
  if (register) {
    return (
      <div>
        <h2 className="font-semibold my-2">ABOUT {firstName.toUpperCase()}</h2>
        <Textarea
          {...register("about")}
          aria-label="about yourself"
          color="secondary"
          variant="bordered"
          classNames={{
            input: "placeholder:text-foreground/50",
            inputWrapper:
              "bg-secondary-50 border-secondary-100 data-[hover=true]:border-secondary-200",
          }}
          placeholder={`Tell us about ${firstName}, their interests, and hobbies.`}
        />
      </div>
    );
  }
};

export default EditAbout;
