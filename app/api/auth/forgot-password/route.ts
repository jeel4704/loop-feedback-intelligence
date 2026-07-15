import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't leak whether user exists for security reasons
      return NextResponse.json({ message: "If an account exists, a password reset link has been sent." }, { status: 200 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiryMinutes = 15;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Generate a unique ID for the OTP record (using cuid or similar, but here we just use crypto)
    const otpId = crypto.randomBytes(16).toString("hex");

    // We use OTPVerification model to store the token since it exists in schema
    // We upsert by email to ensure a user only has one active OTP at a time
    await prisma.oTPVerification.upsert({
      where: { email },
      update: {
        hashedOtp: token, // storing raw token as "hashedOtp" for simplicity in this flow
        purpose: "PASSWORD_RESET",
        expiresAt,
        attempts: 0,
        resends: 0,
        verified: false,
        updatedAt: new Date(),
      },
      create: {
        id: otpId,
        email,
        hashedOtp: token,
        purpose: "PASSWORD_RESET",
        expiresAt,
        updatedAt: new Date(),
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(token)}`;
    console.log("-----------------------------------------");
    console.log("✉️ [DEVELOPMENT Reset Link]:", resetUrl);
    console.log("-----------------------------------------");

    try {
      await sendPasswordResetEmail(email, token, expiryMinutes);
    } catch (mailError: any) {
      console.warn("Password reset email send failed, returning link for local development:", mailError);
      return NextResponse.json({ 
        message: "Email delivery failed, but you can copy/paste this reset link in local dev mode.",
        resetUrl
      }, { status: 200 });
    }

    return NextResponse.json({ message: "If an account exists, a password reset link has been sent." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password route error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
