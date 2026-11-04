import React from "react";
import { Button, Input, Checkbox, Link, Form } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { getApiError } from "@/utils/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
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
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState<boolean>(
    localStorage?.getItem("rememberMe") === "true"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: (localStorage.getItem("email") as string) || "",
      password: "",
    },
  });
  const toggleVisibility = () => setIsVisible(!isVisible);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/login",
        data,
        { withCredentials: true }
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      // navigation("/dashboard", {
      //   replace: true,
      // });
    },
  });
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // "Remember me" keeps only the email. Never store the password.
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("email", data.email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("email");
      }
      await mutateAsync(data);
    } catch (error) {
      console.error("Login failed", error);
      const { message, fields } = getApiError(error, "Failed to log in, please try again");
      for (const [name, msg] of Object.entries(fields)) {
        if (name === "email" || name === "password") setError(name, { message: msg }, { shouldFocus: true });
      }
      setError("root", { message });
    }
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-2">
          <img src="/brand/devtinder-code-heart-icon.svg" alt="DevTinder" className="w-16 h-16" />
          <p className="text-xl font-medium">Welcome Back</p>
          <p className="text-small text-default-500">
            Log in to your account to continue
          </p>
          <Link
            href="/"
            className="flex justify-center w-full text-center text-sm cursor-pointer my-4"
          >
            <Icon className="w-5 h-5" icon={"mdi-light:home"} />
            <span>Home</span>
          </Link>
        </div>
        <Form
          className="flex flex-col gap-3"
          validationBehavior="native"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            isRequired
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            {...register("email")}
            // isInvalid={errors.email?.message ? true : false}
            // errorMessage={errors.email?.message}
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
          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox
              onChange={(e) => {
                setRememberMe(e.currentTarget.checked);
              }}
              isSelected={rememberMe}
              name="remember"
              size="sm"
            >
              Remember me
            </Checkbox>
            <Link className="text-default-500" href="#" size="sm">
              Forgot password?
            </Link>
          </div>
          <Button
            className="w-full"
            color="primary"
            type="submit"
            disabled={isSubmitting}
          >
            Sign In
          </Button>
          {errors?.root && (
            <label className="w-full text-center text-red-600">
              {errors.root.message}
            </label>
          )}
        </Form>
        {/* ponytail: Google/GitHub buttons removed — no OAuth backend exists. Add with the auth routes. */}
        <p className="text-center text-small">
          Need to create an account?&nbsp;
          <Link href="/signup" size="sm">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
