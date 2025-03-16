import { UpdateProfile } from "@/queries/types";
import useAuthStore from "@/store/authStore";
import { Icon } from "@iconify/react";
import { Textarea } from "@heroui/react";
import { UseFormRegister } from "react-hook-form";

const EditAbout = ({
  register,
  isReadOnly = false,
  value,
}: {
  register?: UseFormRegister<UpdateProfile>;
  isReadOnly?: boolean;
  value?: string;
}) => {
  const { user } = useAuthStore();
  if (isReadOnly) {
    return (
      <div className="bg-secondary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden ">
        <span className="flex gap-1 items-center font-semibold text-gray-200 text-sm md:text-base">
          <Icon icon={"gridicons:quote"} className="w-4 h-4" />
          About me
        </span>
        <span className="items-center my-1 text-xs md:text-sm">{value}</span>
      </div>
    );
  }
  if (register) {
    return (
      <div>
        <h2 className="font-semibold my-2">
          ABOUT {user?.firstName.toUpperCase()}
        </h2>
        <Textarea
          {...register("about")}
          color="secondary"
          variant="bordered"
          classNames={{
            input: "placeholder:text-foreground/50",
            inputWrapper:
              "bg-secondary-50 border-secondary-100 data-[hover=true]:border-secondary-200",
          }}
          placeholder={`Tell us about ${user?.firstName}, their interests, and hobbies.`}
        />
      </div>
    );
  }
};

export default EditAbout;
