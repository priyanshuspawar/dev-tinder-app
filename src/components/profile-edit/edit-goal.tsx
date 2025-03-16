import { UpdateProfile } from "@/queries/types";
import { lookingFor } from "@/utils/constants";
import { Select, SelectItem } from "@heroui/react";
import { Control, Controller } from "react-hook-form";
import { Icon } from "@iconify/react";

const EditGoal = ({
  control,
  isReadOnly = false,
  value,
}: {
  control?: Control<UpdateProfile>;
  isReadOnly?: boolean;
  value?: any;
}) => {
  return (
    <div>
      <h2 className="font-semibold my-2">RELATION GOALS</h2>
      {isReadOnly ? (
        <div className="bg-secondary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden">
          <span className="flex gap-2 items-center font-semibold text-gray-300 text-xs md:text-sm">
            <Icon icon={"iconamoon:search"} />
            Looking for ?
          </span>
          <span className="text-medium md:text-lg inline-flex gap-1 items-center font-semibold px-1 my-1 text-white/95">
            <span style={{ textShadow: "0 0 20px #FCADF9" }}>✨</span>{" "}
            {value ?? "Still figuring out"}
          </span>
        </div>
      ) : (
        <Controller
          name="lookingFor"
          control={control}
          render={({ field }) => (
            <Select
              className="w-full"
              items={lookingFor}
              variant="bordered"
              classNames={{
                mainWrapper: "bg-secondary-50",
                trigger:
                  "border-secondary-100 data-[hover=true]:border-secondary-200",
                value: "text-foreground/50",
                popoverContent: "bg-secondary-50",
              }}
              selectedKeys={field.value ? [field.value] : []}
              onChange={(value) => field.onChange(value)} // Update form value on change
              placeholder="Looking for ?"
            >
              {(option) => (
                <SelectItem
                  key={option.label}
                  classNames={{
                    base: "data-[hover=true]:bg-primary data-[selectable=true]:focus:bg-primary",
                  }}
                >
                  {option.label}
                </SelectItem>
              )}
            </Select>
          )}
        />
      )}
    </div>
  );
};

export default EditGoal;
