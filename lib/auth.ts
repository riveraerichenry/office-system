import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export type JwtRole = {
  id: string;
  role_name: string;
};

type JwtUser = {
  id: string;
  username: string;
  full_name: string;

  roles: JwtRole[];
};

export function createToken(user: JwtUser) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      roles: user.roles,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}