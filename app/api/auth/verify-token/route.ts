import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, token, type } = await request.json()

    console.log("🔍 Verify token request:", { email, token, type })

    if (!email || !token || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Find the verification token in the database
    // The token is stored as "type:code" format
    const expectedToken = `${type}:${token}`
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: expectedToken,
        expires: { gt: new Date() }
      }
    })

    if (!verificationToken) {
      console.log("❌ Token not found or expired")
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    console.log("✅ Token found and valid")

    // Handle signup vs signin
    if (type === "signup") {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        // Delete the verification token
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: verificationToken.identifier,
              token: verificationToken.token
            }
          }
        })

        return NextResponse.json(
          { success: false, message: "User already exists. Please sign in instead." },
          { status: 400 }
        )
      }

      // Create new user with roles array
      const newUser = await prisma.user.create({
        data: {
          email,
          roles: ['USER'], // Default role as Role enum (USER)
        }
      })

      console.log("✅ User created:", { userId: newUser.id, email })

      // Delete the verification token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        userId: newUser.id,
        email: newUser.email
      })
    } else if (type === "signin") {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Delete the verification token
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: verificationToken.identifier,
              token: verificationToken.token
            }
          }
        })

        return NextResponse.json(
          { success: false, message: "User not found. Please sign up first." },
          { status: 400 }
        )
      }

      console.log("✅ User verified:", { userId: user.id, email })

      // Delete the verification token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        userId: user.id,
        email: user.email
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid verification type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("❌ Verification error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
