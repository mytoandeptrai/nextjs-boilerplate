export interface ICreateQuoteResponse {
  id: string;
  totalEstimate: number;
  /** `false` when the alert could not be sent (the quote is saved either way). Always `false` for Zalo orders. */
  emailSent: boolean;
}

/** Body of the 409 answered when a cart line points at a product that is gone or inactive. */
export interface IUnavailableProductsError {
  message: string;
  unavailableProductIds: string[];
}
