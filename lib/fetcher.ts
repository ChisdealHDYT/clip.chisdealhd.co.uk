const dev = process.env.NODE_ENV !== "production";
export const host = dev ? "http://localhost:3000" : "https://clip.chisdealhd.co.uk";

export const fetcher = async (query: string) =>
  await fetch(`${host}/api/gql`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
