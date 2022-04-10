import { ApolloServer, gql } from "apollo-server";
import { typeDefs } from "./schema";
import { Query, Mutation, Profile, Post, User } from "./resolvers/";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserFromToken } from "./utils/getUserFromToken";

export const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient<
        Prisma.PrismaClientOptions, 
        never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
        >;
        userInfo: {
            userId: number;
        } | null
}

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Query,
        Mutation, 
        Profile,
        Post,
        User,
    },
    //function that returns an object instead of just object
    //because inside of the parameters we can extract the request
    //for example the authorization header
    context: async ({ req }: any): Promise<Context> => {
        const userInfo = await getUserFromToken(req.headers.authorization);
        return {
            prisma,
            userInfo,
        };
    },
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server is ready on ${url}`);
})