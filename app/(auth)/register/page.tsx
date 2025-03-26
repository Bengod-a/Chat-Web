"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import InputImage from "../../../components/Input/InputImage";
import toast from "react-hot-toast";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Animation from "../../../components/animation/Animation";

const Signup = () => {
  const [formdata, setFormdata] = useState({
    name: "" as string,
    email: "" as string,
    password: "" as string,
    confirmPassword: "" as string,
    image: null as File | null,
  });
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

    const formData = new FormData();
    formData.append("name", formdata.name);
    formData.append("email", formdata.email);
    formData.append("password", formdata.password);
    formData.append("confirmPassword", formdata.confirmPassword);
    if (formdata.image) {
      formData.append("image", formdata.image);
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      router.push("/login");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row ">
      <div className="w-full z-50 md:w-1/3 bg-gradient-to-br from-purple-500 to-blue-500 flex flex-col justify-between text-white p-10 md:p-20 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold">Ben Message</h1>
        <h1 className="text-2xl md:text-4xl font-bold">
          Welcome to Ben Message 🤖
        </h1>
      </div>

      <div className="w-full md:w-1/1 bg-black flex flex-col justify-center  h-full items-center text-white p-6 md:p-10 relative">
        <div className="absolute inset-0 pointer-events-none">
          <Animation />
        </div>

        <div className="w-full max-w-md bg-gray-900 p-6 md:p-8 rounded-lg shadow-lg relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6  texts">
            Sign Up.
          </h2>

          <form className="flex flex-col gap-4 z-50" onSubmit={Submit}>
            <div className="z-50">
              <label className="block text-gray-400">Username</label>
              <input
                type="text"
                className="w-full z-50 p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
                placeholder="Enter username"
                onChange={(e) =>
                  setFormdata({ ...formdata, name: e.target.value })
                }
              />
            </div>

            <div className="z-50">
              <label className="block text-gray-400">Email Address</label>
              <input
                type="email"
                className="w-full p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
                placeholder="Enter email"
                onChange={(e) =>
                  setFormdata({ ...formdata, email: e.target.value })
                }
              />
            </div>

            <div className="z-50">
              <label className="block text-gray-400">Password</label>
              <input
                type="text"
                className="w-full p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
                placeholder="Enter password"
                onChange={(e) =>
                  setFormdata({ ...formdata, password: e.target.value })
                }
              />
            </div>

            <div className="z-50">
              <label className="block text-gray-400">Confirm Password</label>
              <input
                type="text"
                className="w-full p-2 rounded-2xl bg-gray-800 text-white outline-none border border-black focus:border-purple-300 transition-all duration-300"
                placeholder="Enter password"
                onChange={(e) =>
                  setFormdata({ ...formdata, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="z-50">
              <InputImage
                onFileChange={(file: File | null) =>
                  setFormdata({ ...formdata, image: file })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-4xl font-semibold z-50"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-4 text-center gap-2 z-50">
            <p className="text-gray-400">
              มีบัญชีอยู่แล้วใช่ไหม?
              <Link href="/login" className="text-blue-400 cursor-pointer ml-2">
                Sign in.
              </Link>
            </p>
          </div>

          <div className="mt-4 mx-auto  cursor-pointer relative z-10">
            <button
              className="bg-gray-800  cursor-pointer flex text-center items-center justify-center p-2 rounded-4xl gap-2 mx-auto w-full"
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
