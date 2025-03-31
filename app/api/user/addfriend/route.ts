import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../DB/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "คุณไม่ได้รับการอนุญาต" }, { status: 400 });
    }

    const { userId } = await req.json();

    if (session.user.id === userId) {
      return NextResponse.json({ message: "คุณไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้" }, { status: 400 });
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: userId },
          { user1Id: userId, user2Id: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ message: "คุณเป็นเพื่อนกับผู้ใช้นี้แล้ว หรือคำขอเพื่อนอยู่ในระหว่างรอการยืนยัน" }, { status: 400 });
    }

    const newFriendship = await prisma.friendship.create({
      data: {
        user1Id: session.user.id,
        user2Id: userId,
        status: 'PENDING',
      },
    });


    return NextResponse.json(newFriendship, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
