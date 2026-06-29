export type CustomerSession = {
  createdAt: string;
  customerId: string;
  email: string;
  fullName: string;
  phone?: string;
  referralCode: string;
};

export type AuthMode = "login" | "signup";

export type AuthResult =
  | {
      ok: true;
      session: CustomerSession;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };
