import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../DB/prisma";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const getFriendship = await prisma.friendship.findMany({
      where: {
        id: numericId,
      },
    });

    return NextResponse.json({ data: getFriendship });
  } catch (error) {
    console.error("Error in GET /api/user/getFriendship/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
