import useAuthStore from "@/store/authStore";
import { getAge } from "@/utils/helpers";
import { Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
  const { user } = useAuthStore();
  const navigation = useNavigate();
  return (
    <div className="flex flex-col items-center overflow-hidden">
      <div className="w-[48rem] sm:w-[60rem] md:w-[66rem] px-10 h-fit py-16 rounded-b-[20rem] sm:rounded-b-[30rem] md:rounded-b-[48rem] bg-secondary-50">
        <div className="flex flex-col items-center">
          <Avatar className="w-36 h-36" src={user?.pictures[0].imgUrl} />
          <h2 className="text-2xl font-medium">
            {user?.firstName}
            <span className="text-xl">
              {user?.dateOfBirth ? ", " + getAge(user.dateOfBirth) : ""}
            </span>
          </h2>
        </div>
        <div className="flex justify-center gap-32 my-2 sm:my-4 md:my-6">
          <div
            onClick={() => {
              navigation("/dashboard/profile/edit");
            }}
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="flex w-fit flex-col bg-secondary-200 border-1 border-white/60 p-3 rounded-full">
              <Icon icon={"ic:round-edit"} className="text-2xl" />
            </span>
            <span className="font-semibold text-xs">Edit Profile</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <span className="flex w-fit flex-col bg-secondary-200 border-1 border-white/60 p-3 rounded-full">
              <Icon icon={"mdi:settings"} className="text-2xl" />
            </span>
            <span className="font-semibold text-xs">Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// import MainCard from "@/components/main-card";
// import useAuthStore from "@/store/authStore";
// import { cn } from "@/utils/helpers";
// import {
//   Button,
//   Card,
//   CardBody,
//   CardFooter,
//   CardHeader as HeroUICardHeader,
//   Divider,
// } from "@heroui/react";
// import { Icon } from "@iconify/react";
// import { useNavigate } from "react-router-dom";

// const Header = ({ firstName, age }: { firstName?: string; age?: number }) => {
//   const { user } = useAuthStore();
//   const navigate = useNavigate();
//   // if (
//   //   !user?.age ||
//   //   user.pictures.length === 0 ||
//   //   user.skills.length === 0 ||
//   //   !user.gender ||
//   //   !user.lookingFor ||
//   //   !user.essentials.location ||
//   //   !user.essentials.education
//   // ) {
//   //   return (
//   //     <Card className="flex flex-col items-center justify-center w-11/12 md:w-2/5 p-4 bg-primary-200">
//   //       <HeroUICardHeader className="font-bold text-2xl justify-center">
//   //         Complete Your Profile ✨
//   //       </HeroUICardHeader>
//   //       <Divider />
//   //       <CardBody className="justify-center">
//   //         <p className="font-semibold text-xl text-center">
//   //           To get started, please complete your profile by providing essential
//   //           information.
//   //         </p>
//   //       </CardBody>
//   //       <CardFooter className="justify-center">
//   //         <Button
//   //           color="primary"
//   //           className="font-semibold"
//   //           onPress={() => {
//   //             navigate("edit");
//   //           }}
//   //         >
//   //           Complete Profile
//   //         </Button>
//   //       </CardFooter>
//   //     </Card>
//   //   );
//   // }
//   return (
//     <div className="p-8">
//       <h1>
//         {firstName} {age || 11}
//       </h1>
//     </div>
//   );
// };

// const ProfileView = () => {
//   const { user } = useAuthStore();
//   return (
//     <MainCard
//       cardHeader={<Header age={user?.age} firstName={user?.firstName} />}
//     >
//       <div className="flex flex-col gap-2 w-full">
//         <div className="h-[425px] relative">
//           <div
//             className="w-full h-1.5 absolute top-2
//         bg-white/40 grid row-span-1 grid-flow-col gap-0.5 items-center
//         "
//           >
//             {Array.from({
//               length: 4,
//             }).map((_, i) => (
//               <span
//                 className={cn(
//                   {
//                     "bg-white border-gray-500": 0 === i,
//                     "bg-gray-600 border-transparent": i !== 0,
//                   },
//                   "h-1 rounded-2xl overflow-hidden cursor-pointer hover:border-primary hover:bg-white border-[0.1px] transition-all duration-200 ease-in-out"
//                 )}
//               />
//             ))}
//           </div>
//           <img
//             src="https://images.girlslife.com/posts/039/39750/sabrinacarpenternewalbum.jpg"
//             className="w-full h-full object-cover"
//           />
//         </div>

//         {/* looking for */}
//         <div className="bg-primary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden">
//           <span className="flex gap-2 items-center font-semibold text-gray-300 text-sm">
//             <Icon icon={"iconamoon:search"} className="w-4 h-4" />
//             Looking for ?
//           </span>
//           <span className="text-xl inline-flex gap-1 items-center font-semibold px-2 my-1 text-white/95">
//             <span style={{ textShadow: "0 0 20px #FCADF9" }}>✨</span> Short
//             term long term
//           </span>
//         </div>
//         {/* essentials */}
//         <div className="bg-primary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden">
//           <span className="flex gap-2 items-center font-semibold text-gray-300 text-sm">
//             <Icon icon={"material-symbols:account-box"} className="w-4 h-4" />
//             Essentials
//           </span>

//           <span className="flex flex-col gap-2 my-2">
//             <div className="flex items-center gap-2 text-sm ">
//               <Icon icon={"icons8:gender"} className="w-4 h-4 " />
//               <span>Male</span>
//             </div>
//             <Divider />

//             <div className="flex items-center gap-2 text-sm ">
//               <Icon icon={"lsicon:education-outline"} className="w-4 h-4 " />
//               <span>Bachelor's Degree</span>
//             </div>
//             <Divider />
//             <div className="flex items-center gap-2 text-sm ">
//               <Icon icon={"tabler:location"} className="w-4 h-4 " />
//               <span>16 km away</span>
//             </div>
//           </span>
//         </div>
//         {/* About */}
//         <div className="bg-primary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden ">
//           <span className="flex gap-2 items-center font-semibold text-gray-300 text-sm">
//             <Icon icon={"gridicons:quote"} className="w-4 h-4" />
//             About me
//           </span>
//           <span className="items-center my-1">
//             Energy speaks for you? Yes I'm so out of it.
//           </span>
//         </div>
//         {/* skills */}
//         <div className="bg-primary-50 w-full py-2 px-4 flex flex-col rounded-2xl overflow-hidden ">
//           <span className="flex gap-2 items-center font-semibold text-gray-300 text-sm">
//             <Icon icon={"iconamoon:star-bold"} className="w-4 h-4" />
//             Skills
//           </span>
//           <span className="flex gap-2 flex-wrap items-center my-2 h-fit w-fit">
//             {["Driving", "Writing", "Music", "JavaScript"].map((skill) => (
//               <span className="bg-primary-200 text-sm inline-flex items-center justify-center rounded-3xl px-3 py-1">
//                 {skill}
//               </span>
//             ))}
//           </span>
//         </div>
//         <div className="my-2" />
//       </div>
//     </MainCard>
//   );
// };

// export default ProfileView;
