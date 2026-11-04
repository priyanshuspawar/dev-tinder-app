"use client";

import type { NavbarProps } from "@heroui/react";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import clsx from "clsx";

const menuItems = ["About", "Privacy Policy", "Safety", "Support"];

export default function NavbarMain(props: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Navbar
      {...props}
      className={clsx(
        // scrim so the nav reads over the busy hero photo
        isMenuOpen ? "bg-background" : "!bg-transparent bg-gradient-to-b from-background/90 via-background/50 to-transparent",
        "top-0 absolute transition-colors duration-200 ease-in-out"
      )}
      position="static"
      classNames={{
        base: cn("border-default-100", {
          "bg-default-200/50 dark:bg-default-100/50": isMenuOpen,
        }),
        wrapper: "w-full justify-center bg-transparent",
        item: "hidden md:flex",
      }}
      height="72px"
      isBlurred={false}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Left Content */}
      <NavbarBrand className="flex items-center">
        <img
          src="/brand/devtinder-code-heart-horizontal.svg"
          alt="DevTinder"
          className="h-11 md:h-12 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
        />
      </NavbarBrand>

      {/* Center Content */}
      <NavbarContent justify="center">
        <NavbarItem isActive>
          <Link
            className="text-default-900 font-bold text-lg tracking-wide"
            href="#"
            size="sm"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-default-900 font-bold text-lg tracking-wide"
            href="#"
            size="sm"
          >
            Privacy Policy
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-default-900 font-bold text-lg tracking-wide"
            href="#"
            size="sm"
          >
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            className="text-default-900 font-bold text-lg tracking-wide"
            href="#"
            size="sm"
          >
            Safety
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right Content */}
      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="ml-2 !flex gap-2">
          <Button
            className="bg-foreground font-medium text-background"
            color="secondary"
            endContent={<Icon icon="solar:alt-arrow-right-linear" />}
            radius="full"
            variant="flat"
          >
            <Link
              href={"/login"}
              className="text-default-50 font-semibold text-lg"
            >
              Get Started
            </Link>
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenuToggle className="text-foreground md:hidden" />

      <NavbarMenu className="top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-background pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 transition-all transform ease-out duration-100">
        <NavbarMenuItem className="mb-4">
          <Button
            fullWidth
            as={Link}
            className="bg-foreground text-background"
            href="/login"
          >
            Get Started
          </Button>
        </NavbarMenuItem>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link className="mb-2 w-full text-default-500" href="#" size="md">
              {item}
            </Link>
            {index < menuItems.length - 1 && <Divider className="opacity-50" />}
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
