import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { uploadProfile } from "../../../../DB/ProfileUser";
import prisma from "../../../../DB/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const image = formData.get("image") as File | null;

    if (!name || !email || !password || !confirmPassword) {
      throw new Error("กรุณากรอกข้อมูลให้ครบ");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "รหัสผ่านไม่ตรงกัน" },
        { status: 400 }
      );
    }

    const haspassword = await hash(password, 12);

    const profile_url = image ? await uploadProfile(image) : undefined;

    const newuser = await prisma.user.create({
      data: {
        name,
        email,
        password: haspassword,
        image: image ? profile_url : undefined,
      },
    });

    return NextResponse.json({
      message: "สร้างบัญชีผู้ใช้เรียบร้อย",
      user: newuser,
    });
  } catch (error:unknown) {
    console.log(error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการสร้างบัญชี" }, { status: 500 });
  }
}
