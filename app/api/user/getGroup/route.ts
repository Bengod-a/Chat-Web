import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "../../../../DB/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return NextResponse.json(
        { message: "คุณไม่ได้รับการอนุญาต" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "User ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              },
            },
          },
        },
      },
    });

    return NextResponse.json(groups, { status: 200 });
  } catch (error: any) {
    console.error(error);
  }
}
