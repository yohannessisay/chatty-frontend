import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp: number;
  }
  
export const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { 
      return true;
    }
  };