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

export const timeAgo = (lastSeenTimestamp: number): string => {
  if (lastSeenTimestamp==null) {
    return 'Long time ago'
  }
  const now = Date.now();
  const diffInMs = now - lastSeenTimestamp;
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  switch (true) {
    case (seconds < 120):
      return "Active";
    case (minutes < 60):
      return `${minutes} minutes ago`;
    case (hours < 24):
      return `${hours} hours ago`;
    default:
      return `${days} days ago`;
  }

};
