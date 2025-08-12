import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Include clinic and branch information in the user query
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            clinic: true,
            branch: true
          }
        });

        if (!user || !user.isActive) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Return additional tenant information
        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          clinicId: user.clinicId,
          branchId: user.branchId,
          // Include clinic and branch basic info if available
          clinicName: user.clinic?.name,
          branchName: user.branch?.name
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Include tenant information in the JWT
        token.role = user.role;
        token.id = user.id;
        token.clinicId = user.clinicId;
        token.branchId = user.branchId;
        token.clinicName = user.clinicName;
        token.branchName = user.branchName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Include tenant information in the session
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.clinicId = token.clinicId;
        session.user.branchId = token.branchId;
        session.user.clinicName = token.clinicName;
        session.user.branchName = token.branchName;
        
        // Debug logging
        console.log('Session callback - user data:', {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          branchId: session.user.branchId,
          clinicId: session.user.clinicId
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
