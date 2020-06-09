import { ApolloServer, gql } from "apollo-server-micro";
import "isomorphic-fetch";
import { Clips, Clip } from "../../interfaces/clips";

const typeDefs = gql`
  type Query {
    clip(contentId: String): Clip
    clips: [Clip]
    lastUpdated: Date
  }

  scalar Date

  type Clip {
    contentId: String
    rawFileUrl: String
    rawFileUrlLowRes: String
    unbrandedFileUrl: String
    contentTitle: String
    contentViews: Int
    contentLikes: Int
    contentThumbnail: String
    categoryId: Int
    videoLengthSeconds: Int
    createdTimestamp: Int
    directClipUrl: String
    embedIframeCode: String
    credits: String
  }
`;

let clips: Clip[] = [];
let lastUpdated = null;

const updateClips = async (): Promise<void> => {
  if (
    lastUpdated !== null &&
    (new Date().getTime() - lastUpdated.getTime()) / 1000 < 600
  )
    return;

  const data: Clips = await fetch(
    `https://developers.medal.tv/v1/latest?userId=6336393&limit=1000&offset=0`,
    {
      headers: {
        Authorization: "4851a20e-40ec-4dad-b3b3-33ceb79b603f",
      },
    }
  ).then((data) => data.json());

  clips = data.contentObjects.map((clip: Clip) => ({
    ...clip,
    createdTimestamp: clip.createdTimestamp / 1000,
  }));
  lastUpdated = new Date();
};

updateClips();

const resolvers = {
  Query: {
    async clips(): Promise<Clip[]> {
      await updateClips();
      return clips;
    },
    async clip(_: any, { contentId }: { contentId: string }): Promise<Clip> {
      await updateClips();
      return clips.filter((clip) => clip.contentId === contentId)[0];
    },
    async lastUpdated(): Promise<string | null> {
      return lastUpdated || new Date();
    },
  },
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({
  typeDefs,
  resolvers,
  playground: false,
}).createHandler({ path: "/api/gql" });
