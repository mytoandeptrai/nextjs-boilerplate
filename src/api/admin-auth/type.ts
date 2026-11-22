export interface ILoginBody {
  email: string;
  password: string;
}

/** The tokens stay in httpOnly cookies, so the browser only learns that the sign-in worked. */
export interface ILoginResponse {
  authenticated: true;
}
