import Navbar from "@/components/navbar";
import { Button } from "@heroui/react";

const Home = () => {
  return (
    <div
      className={`bg-[url(/bg-landing-page-4k.png)] flex flex-col w-full h-screen bg-cover items-center justify-center`}
    >
      <Navbar />
      <h2
        className="text-4xl sm:text-5xl px-4 lg:text-7xl md:text-6xl font-bold text-wrap text-center max-w-[75vw]"
        style={{
          textShadow: "4px 2px #2a2a2a",
        }}
      >
        Connect. Collaborate. Code.
      </h2>
      <Button
        variant="bordered"
        color="default"
        size="lg"
        className="my-4 text-lg px-16 md:hidden tracking-wide font-bold rounded-full border-foreground"
      >
        Log in
      </Button>
    </div>
  );
};

export default Home;
