import * as z from "zod";

const validateAge = (d: string | null) => {
  if (!d) return true; // Allow null values
  const dob = new Date(d);
  const today = new Date();
  // allowed ages: 18–99 (same rule as the server's profileValidator.ts)
  const minAgeDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const maxAgeDate = new Date(
    today.getFullYear() - 99,
    today.getMonth(),
    today.getDate()
  );

  return dob <= minAgeDate && dob >= maxAgeDate;
};

export const updateSchema = z.object({
  firstName: z.string().min(2).max(25).trim().optional(),
  lastName: z.string().min(1).max(25).trim().optional(),

  dateOfBirth: z
    .string()
    .refine(
      (val) => {
        if (!val) {
          return false;
        }
        return !isNaN(Date.parse(val));
      },
      {
        message: "Invalid date format. Use YYYY-MM-DD.",
      }
    )
    .refine((val) => validateAge(val), {
      message: "Invalid age.",
    })
    .optional(),

  about: z.string().trim().max(75, "About can be at most 75 characters").optional(),
  gender: z.enum(["male", "female", "other"]).optional(),

  skills: z
    .array(
      z.object({
        _id: z.string().optional(),
        label: z.string(),
      })
    )
    .max(4, "Skills must be an array with a maximum of 4 items")
    .default([]), // Ensuring an empty array if not provided

  pictures: z
    .array(
      z.object({
        _id: z.string().optional(),
        imgUrl: z.instanceof(File).or(z.string()),
      })
    )
    .max(5, "A maximum of 5 pictures are allowed")
    .default([]), // Ensuring an empty array if not provided

  lookingFor: z
    .enum([
      "Still figuring out",
      "Dynamic Duo",
      "Tech Partner",
      "Short Term",
      "Gonna go with flow",
    ])
    .optional(),

  education: z.string().min(2).max(50).trim().optional(), // Fix
  // Fix
});
