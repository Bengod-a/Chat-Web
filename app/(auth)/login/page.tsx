"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Animation from "../../../components/animation/Animation";

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const session = useSession();

  const router = useRouter();

  useEffect(() => {
    session.update();
    if (session.data?.user) {
      router.push("/");
    }
  }, [session]);

  

  const Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res) {
        toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        return;
      }
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("ล็อกอินสำเร็จ");
      router.push("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="w-full z-50  md:w-1/3 bg-gradient-to-br from-purple-500 to-blue-500 flex flex-col justify-between text-white p-10 md:p-20 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl  font-bold">Ben Message</h1>
        <h1 className="text-2xl md:text-4xl font-bold">
          Welcome to Ben Message 🤖
        </h1>
      </div>

      <div className="w-full md:w-1/1 bg-black flex flex-col justify-center items-center h-full text-white p-6 md:p-10 relative">

          <div className="absolute inset-0 pointer-events-none">
              <Animation />
            </div>

        <div className="w-full max-w-md bg-gray-900 p-6 md:p-8 rounded-lg shadow-lg relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6  texts">
            Sign In
          </h2>

          <form className="flex flex-col gap-4" onSubmit={Submit}>
            <div>
              <label className="block text-gray-400">Email Address</label>
              <input
                type="email"
                className="w-full p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-400">Password</label>
              <input
                type="text"
                className="w-full p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-xl font-semibold"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 text-center gap-2">
            <p className="text-gray-400">
              ไม่มีบัญชี?
              <Link
                href="/register"
                className="text-blue-400 cursor-pointer ml-2"
              >
                Sign Up.
              </Link>
            </p>
          </div>

          <div className="mt-4 mx-auto">
            <button
              className="bg-gray-800 flex cursor-pointer text-center items-center justify-center p-2 rounded-4xl gap-2 mx-auto w-full"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <Icon icon="flat-color-icons:google" width="20" height="20" />
              Sign Up With Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
