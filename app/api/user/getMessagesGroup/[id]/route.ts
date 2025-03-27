import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../DB/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";

interface MessageResponse {
  id: number;
  content: string | null;
  createdAt: Date;
  sender: { id: number; name: string | null; image: string | null };
  receiverId: number | null;
  groupId: number | null;
  file: string | null;
}

export async function GET(request: NextRequest, context: any) {
  try {
    const { params } = context;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const groupIdInput = params.id;

    const groupId = parseInt(groupIdInput, 10);
    if (isNaN(groupId)) {
      return NextResponse.json(
        { message: "Invalid groupId: ต้องเป็นตัวเลข" },
        { status: 400 }
      );
    }

    const groupExists = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!groupExists) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    if (groupExists.members.length === 0) {
      return NextResponse.json(
        { message: "คุณไม่ได้เป็นสมาชิกของกลุ่มนี้" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        groupId,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        file: true,
        senderId: true,
        receiverId: true,
        groupId: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(messages as MessageResponse[], { status: 200 });
  } catch (error) {
    console.error(error);
  }
}
