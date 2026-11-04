// filepath: /c:/Users/priya/OneDrive/Desktop/DevTinder/dev-tinder-app/src/pages/signup.tsx
"use client";

import React from "react";
import { Button, Input, Checkbox, Link, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { AcmeIcon } from "@/components/acme";
import { useNavigate } from "react-router-dom";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z
    .string()
    .min(0)
    .max(25, "last name cannot be more than 25 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isVisible, setIsVisible] = React.useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/signup",
        data,
        { withCredentials: true }
      );
      if (response.status === 200) {
        addToast({
          title: "Account created",
          description: "Log in to start matching.",
          color: "success",
        });
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("root", {
          message:
            error.response?.data.message ??
            "Failed to sign up try again after some time",
        });
      }
      console.error("Signup failed", error);
    }
  };

  return (
    <div className="flex min-h-screen py-8 w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-2 rounded-large">
        <div className="flex flex-col items-center pb-2">
          <AcmeIcon size={60} />
          <p className="text-xl font-medium">Create your account</p>
          <p className="text-small text-default-500">
            Sign up to start meeting developers near you
          </p>
          <Link
            href="/"
            className="flex justify-center w-full text-center text-sm cursor-pointer my-4"
          >
            <Icon className="w-5 h-5" icon={"mdi-light:home"} />
            <span>Home</span>
          </Link>
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <Input
            isRequired
            label="First Name"
            placeholder="Enter your first name"
            type="text"
            variant="bordered"
            {...register("firstName")}
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            type="text"
            variant="bordered"
            {...register("lastName")}
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName?.message}
          />
          <Input
            isRequired
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            {...register("email")}
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            {...register("password")}
            isInvalid={errors.password?.message ? true : false}
            errorMessage={errors.password?.message}
          />
          <Checkbox
            className="py-4"
            {...register("terms")}
            size="sm"
            isInvalid={!!errors.terms}
          >
            I agree with the&nbsp;
            <Link href="#" size="sm">
              Terms
            </Link>
            &nbsp; and&nbsp;
            <Link href="#" size="sm">
              Privacy Policy
            </Link>
          </Checkbox>
          <Button color="primary" type="submit" isLoading={isSubmitting}>
            Sign Up
          </Button>
          {errors?.root && (
            <label className="w-full text-center text-red-600">
              {errors.root.message}
            </label>
          )}
        </form>
        {/* ponytail: Google/GitHub buttons removed — no OAuth backend exists. Add with the auth routes. */}
        <p className="text-center text-small">
          Already have an account?&nbsp;
          <Link href="/login" size="sm">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
