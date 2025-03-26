"use client";

import React, { useEffect, useState } from "react";
import SideBar from "./SideBar";
import ChatPanel from "./ChatPanel";
import SideBarMobi from "./SideBarMobi";
import { useSession } from "next-auth/react";
import Notifications from "../page/Notifications";
import { useRouter } from "next/navigation";
import Srarch from "./Srarch";
import ChatWindow from "./ChatWindow";
import CallModal from "./CallModal";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const MessagesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<
    "home" | "notifications" | "search"
  >("home");
  const [pl, setPl] = React.useState(false);
  const [searchPanel, setSearchPanel] = React.useState(false);
  const [home, setHome] = React.useState(true);
  const [call, setCall] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && status === "authenticated") {
      socket.on("call", (data) => {
        console.log(data);
        if (data.chatId.includes(session.user.id.toString())) {
          setCall(true); 
        }
      });
      return () => {
        socket.off("call");
      };
    }
  }, [session, status,]);
  

  return (
    <div className="flex flex-col h-screen w-full md:flex-row">
      <div className="hidden md:block">
        <SideBar
          setPl={setPl}
          setSearchPanel={setSearchPanel}
          setHome={setHome}
        />
      </div>

      {call && <CallModal />}

      <div className="md:hidden gap-2">
        <SideBarMobi
          setPl={setPl}
          setSearchPanel={setSearchPanel}
          setHome={setHome}
        />
      </div>

      <div className="flex-1 flex h-full w-full gap-2">
        {home && <ChatPanel />}
        {pl && <Notifications />}
        {searchPanel && <Srarch />}
      </div>
    </div>
  );
};

export default MessagesPage;
