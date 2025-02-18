import NavbarMain from "@/components/navbar";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <div>
      <NavbarMain />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
