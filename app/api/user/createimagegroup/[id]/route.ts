// import { NextRequest, NextResponse } from "next/server";
// import prisma from "../../../../../DB/prisma";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../../../../../lib/auth";
// import { uploadProfile } from "../../../../../DB/ProfileUser";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_KEY!
// );

// export async function POST( req: NextRequest, { params }: { params: { id: string } }
// ) {
//   try {
//     const formData = await req.formData();
//     const image = formData.get("image") as File | null;
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user?.id) {
//       return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
//     }

//     const { id } = params; 

//     if (!id || isNaN(Number(id))) {
//       return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
//     }

//     const group = await prisma.group.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!group) {
//       return NextResponse.json({ message: "ไม่พบกลุ่ม" }, { status: 404 });
//     }

//     if (group.image) {
//       const filePath = group.image.split("/").pop(); 
//       const { error: storageError } = await supabase.storage
//         .from("profileuser")
//         .remove([filePath || id]);
//       if (storageError) {
//         throw new Error(`ไม่สามารถลบรูปภาพเก่าได้: ${storageError.message}`);
//       }
//     }

//     if (!image) {
//       return NextResponse.json(
//         { message: "กรุณาเลือกไฟล์รูปภาพ" },
//         { status: 400 }
//       );
//     }

//     const profile_url = await uploadProfile(image);
//     if (!profile_url) {
//       throw new Error("ไม่สามารถอัปโหลดรูปภาพได้");
//     }

//     const updatedGroup = await prisma.group.update({
//       where: { id: Number(id) },
//       data: { image: profile_url },
//     });

//     return NextResponse.json(
//       {
//         message: "เปลี่ยนรูปกลุ่มสำเร็จ",
//         data: {
//           id: updatedGroup.id,
//           image: updatedGroup.image,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("เกิดข้อผิดพลาด:", error);
//     return NextResponse.json(
//       { message: "เกิดข้อผิดพลาดในการเปลี่ยนรูปกลุ่ม" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../DB/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { uploadProfile } from "../../../../../DB/ProfileUser";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: NextRequest, { params }:any) { 
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: Number(id) },
    });

    if (!group) {
      return NextResponse.json({ message: "ไม่พบกลุ่ม" }, { status: 404 });
    }

    if (group.image) {
      const filePath = group.image.split("/").pop();
      const { error: storageError } = await supabase.storage
        .from("profileuser")
        .remove([filePath || id]);
      if (storageError) {
        throw new Error(`ไม่สามารถลบรูปภาพเก่าได้: ${storageError.message}`);
      }
    }

    if (!image) {
      return NextResponse.json(
        { message: "กรุณาเลือกไฟล์รูปภาพ" },
        { status: 400 }
      );
    }

    const profile_url = await uploadProfile(image);
    if (!profile_url) {
      throw new Error("ไม่สามารถอัปโหลดรูปภาพได้");
    }

    const updatedGroup = await prisma.group.update({
      where: { id: Number(id) },
      data: { image: profile_url },
    });

    return NextResponse.json(
      {
        message: "เปลี่ยนรูปกลุ่มสำเร็จ",
        data: {
          id: updatedGroup.id,
          image: updatedGroup.image,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเปลี่ยนรูปกลุ่ม" },
      { status: 500 }
    );
  }
}