import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { UpdateProfile } from "@/queries/types";
import { Button, Chip, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import { nanoid } from "nanoid";
import { cn } from "@/utils/helpers";
const EditSkills = ({
  fields,
  remove,
  setActiveDropDown,
  setIsOpen,
  userSkills,
  skills,
  isReadOnly,
}: {
  setActiveDropDown?: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  fields?: FieldArrayWithId<UpdateProfile, "skills", "id">[];
  remove?: UseFieldArrayRemove;
  skills?: { _id: string; label: string }[];
  userSkills?: string[];
  isReadOnly?: boolean;
}) => {
  if (isReadOnly && skills) {
    return (
      <>
        {skills.length > 0 && (
          <div className="bg-secondary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden">
            <span className="flex items-center gap-1 font-medium text-sm mb-1">
              <Icon
                icon={"material-symbols-light:interests"}
                className="w-5 h-5 text-white"
              />
              <span>Interests</span>
            </span>
            <div aria-label="skills" className="flex flex-wrap gap-2">
              {skills.map((e) => {
                const isMatch = userSkills
                  ? userSkills.includes(e.label)
                  : false;
                return (
                  <Chip
                    variant="bordered"
                    size="sm"
                    classNames={{
                      content: "font-medium",
                    }}
                    className={cn(
                      isMatch
                        ? "bg-gradient-to-r from-primary to-primary-200 border-none"
                        : ""
                    )}
                    key={e._id}
                  >
                    {e.label}
                  </Chip>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  if (setActiveDropDown && fields && setIsOpen && remove) {
    return (
      <div className="flex flex-col">
        <h2 className="font-semibold my-2">SKILLS</h2>
        <div className="flex gap-2 flex-wrap items-center">
          {fields.map((field, index) => (
            <Chip
              variant="flat"
              color="secondary"
              key={field.id}
              onClose={() => remove(index)}
            >
              {field.label}
            </Chip>
          ))}
          <Button
            size="sm"
            isIconOnly
            radius="full"
            color="secondary"
            onPress={() => {
              setActiveDropDown("add-skills");
              setIsOpen(true);
            }}
          >
            <Icon icon="line-md:plus" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }
  return null;
};

const EditSkillsDropdown = ({
  append,
  setActiveDropDown,
  setIsOpen,
}: {
  append: UseFieldArrayAppend<UpdateProfile, "skills">;
  setActiveDropDown: React.Dispatch<React.SetStateAction<string | null>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [localSkill, setLocalSkill] = React.useState("");
  return (
    <div className="flex flex-col items-center p-4 gap-2">
      <h2 className="font-semibold">Enter a Skill</h2>
      <Input
        label="Skill"
        onChange={(e) => {
          setLocalSkill(e.target.value);
        }}
        value={localSkill}
        variant="bordered"
        className="border-secondary"
        classNames={{
          input: "border-secondary",
          mainWrapper: "border-secondary",
        }}
      />
      <Button
        onPress={() => {
          if (localSkill.trim().length < 2) return;
          append({
            _id: nanoid(6),
            label: localSkill,
          });
          setLocalSkill("");
          setIsOpen(false);
          setActiveDropDown(null);
        }}
        variant="flat"
        color="primary"
      >
        ADD
      </Button>
    </div>
  );
};

export { EditSkills, EditSkillsDropdown };
