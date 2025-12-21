import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email || !type) {
      return NextResponse.json(
        { message: "Email and type are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    // For signup: user should NOT exist
    if (type === "signup" && existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      )
    }

    // For signin: user MUST exist
    if (type === "signin" && !existingUser) {
      return NextResponse.json(
        { message: "No account found with this email. Please sign up first." },
        { status: 400 }
      )
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    })

    // Store verification code in database with type
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: `${type}:${code}`, // Prefix with type
        expires: expiresAt,
      },
    })

    // Send email with verification code
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "your_resend_api_key_here") {
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "CookFort <noreply@cookfort.com>",
        to: email,
        subject: `Your CookFort ${type === 'signup' ? 'Sign Up' : 'Sign In'} Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">${type === 'signup' ? 'Welcome to CookFort!' : 'Sign In to CookFort'}</h2>
            <p style="color: #666; font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      })
    } else {
      // Development mode - log the code
      console.log('\n🔐 ========================================')
      console.log(`📧 ${type.toUpperCase()} OTP CODE (Development Mode)`)
      console.log('========================================')
      console.log(`To: ${email}`)
      console.log(`Code: ${code}`)
      console.log(`Expires in: 5 minutes`)
      console.log('========================================\n')
    }

    return NextResponse.json(
      { message: "Verification code sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Send code error:", error)
    return NextResponse.json(
      { message: "Failed to send verification code" },
      { status: 500 }
    )
  }
}
