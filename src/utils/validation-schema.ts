import * as z from "zod";

const validateAge = (d: string) => {
  const dob = new Date(d);
  const today = new Date();
  const minAgeDate = new Date();
  minAgeDate.setFullYear(today.getFullYear() - 15);

  const maxAgeDate = new Date();
  maxAgeDate.setFullYear(today.getFullYear() - 99);

  if (dob > minAgeDate) {
    return false;
  }
  if (dob < maxAgeDate) {
    return false;
  }
  return true;
};

export const updateSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .max(25, "First name must be no more than 25 characters long")
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(1, "Last name must be at least 1 character long")
    .max(25, "Last name must be no more than 25 characters long")
    .trim()
    .optional(),

  dateOfBirth: z
    .string({ message: "Please enter a valid date" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Use YYYY-MM-DD.",
    })
    .refine((val) => validateAge(val), {
      message: "Invalid age.",
    })
    .optional(),

  about: z.string().trim().optional(),

  gender: z.enum(["male", "female", "other"]).optional(),

  skills: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
      })
    )
    .max(4, "Skills must be an array with a maximum of 4 items")
    .default([]),

  pictures: z
    .array(
      z.object({
        _id: z.string(),
        imgUrl: z.instanceof(File).or(z.string()),
      })
    )
    .max(5, "A maximum of 5 pictures are allowed")
    .optional(),

  lookingFor: z
    .enum([
      "Still figuring out",
      "Dynamic Duo",
      "Tech Partner",
      "Short Term",
      "Gonna go with flow",
    ])
    .optional(),

  education: z
    .string()
    .min(2, "Education must be at least 2 characters long")
    .max(50, "Education must be no more than 50 characters long")
    .trim()
    .optional(),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters long")
    .max(100, "Location must be no more than 100 characters long")
    .trim()
    .optional(),
});
