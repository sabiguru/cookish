import { Role } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: Role[];
    } & DefaultSession['user'];
  }

  interface User {
    roles: Role[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles: Role[];
  }
}
