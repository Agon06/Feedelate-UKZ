import "express-session";

declare module "express-session" {
  interface SessionData {
    user: any;
  }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      emri: string;
      mbiemri: string;
      email: string;
      type: string;
      profilePicture?: string;
    }
  }
}

export {};
