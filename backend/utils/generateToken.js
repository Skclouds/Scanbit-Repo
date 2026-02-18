import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
};
