import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    // Find the OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        hashedOtp: token,
        purpose: "PASSWORD_RESET",
        expiresAt: {
          gt: new Date() // Must not be expired
        }
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired password reset link." }, { status: 400 });
    }

    // Find the user by email from the OTP record
    const user = await prisma.user.findUnique({
      where: { email: otpRecord.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Hash the new password and update the user record
    const passwordHash = hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      // Delete the OTP record so it can't be reused
      prisma.oTPVerification.delete({
        where: { id: otpRecord.id }
      })
    ]);

    return NextResponse.json({ message: "Password reset successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Reset password route error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
