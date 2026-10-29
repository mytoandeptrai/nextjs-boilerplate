export interface ILoginBody {
  email: string;
  password: string;
}

/** The BFF keeps the tokens in httpOnly cookies, so the browser only learns that the login worked. */
export interface ILoginResponse {
  authenticated: true;
}
