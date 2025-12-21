import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 CREATE SESSION: API called")

    const { email } = await request.json()
    console.log("🔐 CREATE SESSION: Request body:", { email })

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    console.log("🔐 CREATE SESSION: Processing for email:", email)

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    console.log("🔐 Creating database session for user:", email)

    // Create session in database (NextAuth database strategy)
    const sessionToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    })

    console.log("🔐 Session token:", sessionToken)
    console.log("✅ Database session created:", session.id)

    // Set NextAuth session cookie (database strategy uses sessionToken directly)
    const cookieStore = await cookies()
    cookieStore.set("next-auth.session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/"
    })

    return NextResponse.json({
      success: true,
      message: "Session created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      }
    })
  } catch (error) {
    console.error("❌ Session creation error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
