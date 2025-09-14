import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user authentication
 * @param userId - User ID to encode in the token
 * @returns JWT token string
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export default generateToken;
