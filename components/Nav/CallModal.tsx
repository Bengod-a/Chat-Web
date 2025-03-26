import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";

const socket = io("http://localhost:5000");

const CallModal = ({ user }: any) => {
  const { data: session } = useSession();
  const [callStatus, setCallStatus] = useState();

  useEffect(() => {
    if (user?.id && session?.user?.id && user.id !== session.user.id) {
      const chatId =
        session.user.id < user.id
          ? `${session.user.id}-${user.id}`
          : `${user.id}-${session.user.id}`;


      socket.on("startcall", (data) => {
        
      });

      return () => {
        socket.off("startcall");
        socket.emit("leave_chat", chatId);
      };
    } else {
      console.log("Invalid chat: caller and recipient are the same");
    }
  }, [user, session]);

  const handleAccept = () => {
    console.log("Call accepted");
  };

  const handleDecline = () => {
    console.log("Call declined");
  };

  return (
    <div className="z-50 fixed inset-0 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-[400px] h-[400px] mx-auto p-6 rounded-lg text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <div className="w-[80px] h-[80px] relative">
            <Image
              className="rounded-full object-cover"
              src="/man.svg"
              alt="Profile"
              width={80}
              height={80}
            />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold">Ben God</h1>
            <p className="text-sm">{callStatus}</p>
          </div>

          <div className="mt-8 flex items-center gap-8">
            <button
              onClick={handleAccept}
              className="bg-green-500 rounded-full p-3 hover:bg-green-600 transition-colors cursor-pointer"
            >
              <Icon icon="proicons:call" width="24" height="24" />
            </button>
            <button
              onClick={handleDecline}
              className="bg-red-500 rounded-full p-3 hover:bg-red-600 transition-colors cursor-pointer"
            >
              <Icon icon="tdesign:call-off" width="24" height="24" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
