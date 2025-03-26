import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "../../../../DB/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "คุณไม่ได้รับการอนุญาต" },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    if (!userId || isNaN(parseInt(userId, 10))) {
      return NextResponse.json(
        { message: "User ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;
    const targetUserId = parseInt(userId, 10);

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { message: "คุณไม่สามารถสร้างกลุ่มกับตัวเองได้" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้ที่ต้องการเพิ่มในกลุ่ม" },
        { status: 404 }
      );
    }

    const newGroup = await prisma.group.create({
      data: {
        name: `กลุ่มของ ${session.user.name || "ผู้ใช้"} และ ${
          targetUser.name || "เพื่อน"
        }`,
        members: {
          create: [
            { userId: currentUserId, role: "ADMIN" },
            { userId: targetUserId, role: "MEMBER" },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    await prisma.message.create({
      data: {
        content: `ยินดีต้อนรับสู่กลุ่ม "${newGroup.name}"!`,
        senderId: currentUserId,
        groupId: newGroup.id,
      },
    });

    return NextResponse.json(newGroup, { status: 200 });
  } catch (error: any) {
    console.error(error);
  }
}
