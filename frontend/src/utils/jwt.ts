import {jwtDecode} from "jwt-decode";

export type JwtPayload = {
  id: string;
  iat?: number;
  exp?: number;
};

export const verifyTokenClient = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    return null;
  }
};
