"use client";

import { useContext, useEffect } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import Loader from "../components/loadeing/Loader";
import { Toaster } from "react-hot-toast";
import { ChatContext } from "./context/GlobalContext";

const socket = io("http://localhost:5000", { autoConnect: true });

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { selectedUser }: any = useContext(ChatContext);

  useEffect(() => {

    if (status === "loading" || !session?.user?.id) {
    
      return;
    }

    const userId = session.user.id;
    socket.emit("join_chat", `${userId}`);

    socket.on("connect", () => {
      console.log("Socket.IO connected, ID:", socket.id);
    });

    socket.on("call", (data) => {
      console.log("Incoming call -->", data);
    });

    return () => {
      socket.off("call");
      socket.off("connect");
    };
  }, [status, session?.user?.id]); 

  return (
    <>
      {children}
      <Loader />
      <Toaster position="top-right" />
    </>
  );
}