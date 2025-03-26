import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../DB/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";

interface MessageResponse {
  id: number;
  content: string | null;
  createdAt: Date;
  sender: { id: number; name: string | null };
  receiverId: number | null;
  file: string | null;
}

export async function GET(request: NextRequest, { params }:any) {
    // console.log("API Route Hit:", req.url); // บันทึกเมื่อมีการเข้าถึงเส้นทาง API
    // ขั้นตอนนี้คือจุดเริ่มต้นของฟังก์ชัน เมื่อมีคำขอ (request) เข้ามาที่เส้นทางนี้ 
    // เช่น http://localhost:3000/api/user/getMessages/5 
    // มันจะพิมพ์ URL ที่ถูกเรียกออกมาในคอนโซลเพื่อให้เรารู้ว่าเส้นทางนี้ถูกเรียกจริง

    try {
      // ใช้ try-catch เพื่อจัดการข้อผิดพลาดที่อาจเกิดขึ้นในโค้ด
      const session = await getServerSession(authOptions);
      // ดึงข้อมูลเซสชันของผู้ใช้จาก NextAuth โดยใช้ authOptions ซึ่งเป็นการตั้งค่าการยืนยันตัวตน
      // เช่น ถ้าผู้ใช้ล็อกอินอยู่ session จะมีข้อมูลเช่น user.id, user.name เป็นต้น
      // ถ้าไม่มีเซสชัน (เช่น ไม่ได้ล็อกอิน) session จะเป็น null

      if (!session || !session.user?.id) {
        return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
      }
      // ตรวจสอบว่าเซสชันมีอยู่และมี user.id หรือไม่
      // ถ้าไม่มี (เช่น ผู้ใช้ไม่ได้ล็อกอิน) จะพิมพ์ "Unauthorized access attempt" ในคอนโซล
      // และส่งการตอบกลับ (response) ไปว่า "ไม่ได้รับอนุญาต" พร้อมสถานะ 401 (Unauthorized)

      const userId = Number(session.user.id);
      // แปลง user.id จากเซสชัน (ซึ่งอาจเป็น string) ให้เป็นตัวเลข (number) 
      // และเก็บไว้ในตัวแปร userId เพื่อใช้เป็น ID ของผู้ใช้ที่ล็อกอินอยู่

      const { id } = await params;
      // ดึงค่า id จาก params ซึ่งมาจาก URL เช่น ถ้า URL เป็น /api/user/getMessages/5 
      // id จะมีค่าเป็น "5" (เป็น string) และพิมพ์ค่า id ออกมาในคอนโซล

      const conversationId = parseInt(id, 10);
      if (isNaN(conversationId)) {
        return NextResponse.json({ message: "ID การสนทนาไม่ถูกต้อง" }, { status: 400 });
      }
      // แปลง id จาก string (เช่น "5") เป็นตัวเลข (number) โดยใช้ parseInt
      // ถ้าแปลงไม่ได้ (เช่น id เป็น "abc" ซึ่งทำให้ได้ NaN) 
      // จะพิมพ์ "Invalid conversation ID: abc" และส่งการตอบกลับว่า "ID การสนทนาไม่ถูกต้อง" 
      // พร้อมสถานะ 400 (Bad Request)

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: conversationId },
            { senderId: conversationId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          file: true,
          senderId: true,
          receiverId: true,
          sender: { select: { id: true, name: true } },
        },
      });
      // ค้นหาข้อความจากฐานข้อมูลโดยใช้ Prisma
      // - where: เงื่อนไขการค้นหา
      //   - OR: หาข้อความที่ตรงกับเงื่อนไขใดเงื่อนไขหนึ่งในสองข้อนี้
      //     1. { senderId: userId, receiverId: conversationId } 
      //        คือข้อความที่ผู้ใช้ (userId) ส่งไปหาคู่สนทนา (conversationId)
      //     2. { senderId: conversationId, receiverId: userId } 
      //        คือข้อความที่คู่สนทนา (conversationId) ส่งมาหาผู้ใช้ (userId)
      // - orderBy: เรียงลำดับข้อความตามเวลา createdAt จากเก่าไปใหม่ (asc = ascending)
      // - select: เลือกเฉพาะฟิลด์ที่ต้องการจากตาราง message และรวมข้อมูล sender (ผู้ส่ง)
      // พิมพ์ข้อความที่พบทั้งหมดออกมาในคอนโซล

      const formattedMessages: MessageResponse[] = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: { id: msg.sender.id, name: msg.sender.name || "Unknown" },
        receiverId: msg.receiverId,
        file: msg.file,
      }));
      // แปลงข้อมูลข้อความที่ได้จาก Prisma ให้อยู่ในรูปแบบ MessageResponse
      // - วนลูปผ่าน messages แต่ละตัว (msg)
      // - สร้างอ็อบเจ็กต์ใหม่ที่มีฟิลด์ตามที่กำหนดใน interface MessageResponse
      // - ถ้า msg.sender.name เป็น null จะใช้ "Unknown" แทน

      return NextResponse.json(formattedMessages, { status: 200 });
      // ส่งข้อมูล formattedMessages กลับไปให้ผู้เรียก API (เช่น frontend)
      // พร้อมสถานะ 200 (OK) ซึ่งหมายถึงการทำงานสำเร็จ
    } catch (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
    }
    // ถ้ามีข้อผิดพลาดเกิดขึ้นใน try block (เช่น Prisma ล้มเหลว หรือการเชื่อมต่อฐานข้อมูลมีปัญหา)
    // จะพิมพ์ข้อผิดพลาดในคอนโซล และส่งการตอบกลับว่า "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"
    // พร้อมสถานะ 500 (Internal Server Error)
  }