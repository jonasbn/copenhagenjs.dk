const express = require("express");
const { graphql } = require("graphql");
const { ApolloServer, gql } = require("apollo-server-express");
import { makeExecutableSchema } from "graphql-tools";
const { videos } = require("./data/videos.js");
const { getEvents, memGetEvents } = require("./src/events.js");
const { getSpeakers } = require("./src/speakers.js");

const typeDefs = gql`
  type Videos {
    youtubeId: String
    title: String
    name: String
  }
  type Presentation {
    title: String
    name: String
  }
  type Event {
    title: String
    markdown: String
    content: String
    link: String
    date: String
    type: String
    presentations: [Presentation]
  }
  type Speaker {
    title: String
    name: String
    slug: String
    event: Event
  }
  type Query {
    hello: String
    events: [Event]
    videos: [Videos]
    searchEvents(query: String): [Event]
    speakers: [Speaker]
    speaker(slug: String!): [Speaker]
    searchSpeakers(name: String!): [Speaker]
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
    events: () => {
      return getEvents();
    },
    videos: () => {
      return videos.map(v => ({
        youtubeId: v[0],
        title: v[1],
        name: v[2]
      }));
    },
    searchEvents: async (parent, { query }) => {
      const data = await graphql(
        schema,
        `
          {
            events {
              title
              markdown
              content
              link
              date
              type
            }
          }
        `
      );
      return data.data.events.filter(e => {
        if (e.title.toLowerCase().includes(query.toLowerCase())) return true;
        if (e.markdown.toLowerCase().includes(query.toLowerCase())) return true;
        return false;
      });
    },
    speakers: () => {
      return getSpeakers();
    },
    searchSpeakers: (parent, { name }) => {
      return getSpeakers().filter(s =>
        s.name.toLowerCase().includes(name.toLowerCase())
      );
    },
    speaker: (parent, { slug }) => {
      return getSpeakers().filter(s =>
        s.slug.toLowerCase().includes(slug.toLowerCase())
      );
    }
  },
  Speaker: {
    event: async (parent, arg) => {
      const event = memGetEvents().find(e => e.link === parent.link);
      return event;
    }
  }
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 9000;
app.listen({ port: PORT }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
);
