import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendMagicLinkEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, workspaceName, password, purpose = "SIGNUP" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid Email" }, { status: 400 });
    }

    const appPurpose = purpose.toUpperCase();

    // Currently only support SIGNUP via magic link
    if (appPurpose !== "SIGNUP") {
      return NextResponse.json({ error: "Magic link flow only supports SIGNUP purpose." }, { status: 400 });
    }

    if (!name || !workspaceName || !password) {
      return NextResponse.json({ error: "Missing name, workspace name, or password for registration." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const token = crypto.randomBytes(32).toString("hex");
    const expiryMinutes = parseInt(process.env.MAGIC_LINK_EXPIRY_MINUTES || "15", 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.pendingUser.upsert({
      where: { email },
      update: { name, workspaceName, passwordHash, token, expiresAt, usedAt: null },
      create: { email, name, workspaceName, passwordHash, token, expiresAt }
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/magic-link/verify?token=${encodeURIComponent(token)}`;
    console.log("-----------------------------------------");
    console.log("✉️ [DEVELOPMENT Verification Link]:", verificationUrl);
    console.log("-----------------------------------------");

    // Send email
    try {
      await sendMagicLinkEmail(email, token, expiryMinutes, workspaceName);
    } catch (mailError: any) {
      console.warn("Magic link email send failed, returning link for local development:", mailError);
      return NextResponse.json({ 
        message: "Email delivery failed, but you can copy/paste this verification link in local dev mode.",
        verificationUrl
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Magic link sent successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Magic link send route error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
