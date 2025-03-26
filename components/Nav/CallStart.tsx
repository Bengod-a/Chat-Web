// import { Icon } from "@iconify/react/dist/iconify.js";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import { useSession } from "next-auth/react";

// const socket = io("http://localhost:5000");

// const CallStart = ({ user }: any) => {
//   const { data: session } = useSession();
//   const [callStatus, setCallStatus] = useState("Calling...");

//   useEffect(() => {
//     if (user?.id && session?.user?.id && user.id !== session.user.id) {
//       const chatId =
//         session.user.id < user.id
//           ? `${session.user.id}-${user.id}`
//           : `${user.id}-${session.user.id}`;
//       console.log("Chat ID:", chatId);

//       socket.emit("join_chat", chatId);

//       socket.on("startcall", (data) => {
//         console.log("Call started with:", data);
//         setCallStatus("Ringing...");
//       });

//       return () => {
//         socket.off("startcall");
//         socket.emit("leave_chat", chatId);
//       };
//     } else {
//       console.log("Invalid chat: caller and recipient are the same");
//     }
//   }, [user, session]);

//   const handleDecline = () => {
//     console.log("Call declined");
//   };

//   return (
//     <div className="z-50 fixed inset-0 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
//       <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-[400px] h-[400px] mx-auto p-6 rounded-lg text-white flex items-center justify-center">
//         <div className="flex flex-col items-center justify-center gap-6 h-full">
//           <div className="w-[80px] h-[80px] relative">
//             {user.image ? (
//               <Image
//                 className="rounded-full object-cover"
//                 src={user.image}
//                 alt="Profile"
//                 width={80}
//                 height={80}
//               />
//             ) : (
//               <Image
//                 className="rounded-full object-cover"
//                 src="/man.svg"
//                 alt="Profile"
//                 width={80}
//                 height={80}
//               />
//             )}
//           </div>

//           <div className="text-center">
//             <h1 className="text-xl font-semibold">{user.name}</h1>
//             <p className="text-sm">{callStatus}</p>
//           </div>

//           <div className="mt-8 flex items-center gap-8">
//             <button
//               onClick={handleDecline}
//               className="bg-red-500 rounded-full p-3 hover:bg-red-600 transition-colors cursor-pointer"
//             >
//               <Icon icon="tdesign:call-off" width="24" height="24" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CallStart;



"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";

const socket = io("http://localhost:5000");

const CallStart = ({ user }: any) => {
  const { data: session } = useSession();
  const [callStatus, setCallStatus] = useState("Calling...");

  useEffect(() => {
    if (!session?.user?.id || !user?.id || user.id === session.user.id) {
      console.log("Invalid call: missing IDs or caller and recipient are the same");
      return;
    }

    const userId = session.user.id;
    socket.emit("join_chat", `${userId}`);
    console.log(`Joined personal room: ${userId}`);

    socket.on("call", (data) => {
      if (data.targetId === userId) {
        console.log("Incoming call:", data);
        setCallStatus("Ringing...");
      }
    });

    return () => {
      socket.off("call");
      socket.emit("leave_chat", `${userId}`);
    };
  }, [session?.user?.id, user?.id]); // Dependency ชัดเจน ป้องกันการรันซ้ำ

  const handleDecline = () => {
    console.log("Call declined");
    // อาจเพิ่ม socket.emit("decline_call", { callerId: session.user.id, targetId: user.id });
  };

  return (
    <div className="z-50 fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-[400px] h-[400px] mx-auto p-6 rounded-lg text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <div className="w-[80px] h-[80px] relative">
            {user.image ? (
              <Image className="rounded-full object-cover" src={user.image} alt="Profile" width={80} height={80} />
            ) : (
              <Image className="rounded-full object-cover" src="/man.svg" alt="Profile" width={80} height={80} />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm">{callStatus}</p>
          </div>
          <div className="mt-8 flex items-center gap-8">
            <button onClick={handleDecline} className="bg-red-500 rounded-full p-3 hover:bg-red-600 transition-colors cursor-pointer">
              <Icon icon="tdesign:call-off" width="24" height="24" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallStart;