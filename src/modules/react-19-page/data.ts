export interface IQuote {
  text: string;
  author: string;
}

/** A slow promise created on the server and handed to a client component that reads it with `use()`. */
export const getQuote = async (): Promise<IQuote> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' };
};
