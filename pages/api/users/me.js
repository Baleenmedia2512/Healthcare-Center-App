import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Return current user info
    const user = {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.name,
      role: session.user.role,
      isActive: true // Since they're logged in
    };

    return res.status(200).json(user);

  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Failed to get user info'
    });
  }
}
