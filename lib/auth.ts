import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import type { Adapter } from 'next-auth/adapters';
import { getSignInEmailHtml, getSignInEmailText } from './email/templates';
import { Resend } from 'resend';

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter is only used for EmailProvider, GoogleProvider, and TwitterProvider
  // CredentialsProvider handles its own user management
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" },
        type: { label: "Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code || !credentials?.type) {
          return null;
        }

        const { email, code, type } = credentials;

        // Find and verify the OTP token
        const expectedToken = `${type}:${code}`;
        const verificationToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: expectedToken,
            expires: { gt: new Date() }
          }
        });

        if (!verificationToken) {
          return null;
        }

        // Handle signup vs signin
        if (type === 'signup') {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (existingUser) {
            // Delete the verification token
            await prisma.verificationToken.delete({
              where: {
                identifier_token: {
                  identifier: verificationToken.identifier,
                  token: verificationToken.token
                }
              }
            });
            return null;
          }

          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email,
              roles: ['USER'],
            }
          });

          // Delete the verification token
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: verificationToken.identifier,
                token: verificationToken.token
              }
            }
          });

          return {
            id: newUser.id,
            email: newUser.email,
            roles: newUser.roles,
          } as any;
        } else if (type === 'signin') {
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            // Delete the verification token
            await prisma.verificationToken.delete({
              where: {
                identifier_token: {
                  identifier: verificationToken.identifier,
                  token: verificationToken.token
                }
              }
            });
            return null;
          }

          // Delete the verification token
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: verificationToken.identifier,
                token: verificationToken.token
              }
            }
          });

          return {
            id: user.id,
            email: user.email,
            roles: user.roles,
          } as any;
        }

        return null;
      }
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);

        // Check if Resend API key is configured
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'CookFort <noreply@cookfort.com>',
            to: email,
            subject: `Sign in to CookFort`,
            text: getSignInEmailText({ url, host }),
            html: getSignInEmailHtml({ url, host }),
          });
        } else {
          // Development mode - log the magic link to console
          console.log('\n🔐 ========================================');
          console.log('📧 SIGN IN EMAIL (Development Mode)');
          console.log('========================================');
          console.log(`To: ${email}`);
          console.log(`Magic Link: ${url}`);
          console.log('========================================\n');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name as string;
        session.user.roles = token.roles as any;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.roles = (user as any).roles;
        token.name = user.name;
      }

      // Always fetch fresh data from DB including chef profile check
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            roles: true,
            name: true,
            chefProfile: { select: { id: true } }
          },
        });
        if (dbUser) {
          token.roles = dbUser.roles;
          token.name = dbUser.name;
          // Add CHEF role if they have a chef profile
          if (dbUser.chefProfile && !dbUser.roles.includes('CHEF')) {
            token.roles = [...dbUser.roles, 'CHEF'];
          }
        }
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
