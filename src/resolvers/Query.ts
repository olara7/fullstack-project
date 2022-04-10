import { Context } from "..";

export const Query = {
    me: (_: any, __: any, { userInfo, prisma }: Context) => {
        //return null if there is no user
        if(!userInfo) return null;
        
        //find the user in the database with the id
        return prisma.user.findUnique({
            where: {
                id: userInfo.userId,
            },
        });
    },

    profile: async (_: any, { userId }: { userId: string }, { prisma, userInfo }: Context ) => {
        
        //check if the id of the profile matches the user, to show add post only on a users own profile
        const isMyProfile = Number(userId) === userInfo?.userId

        //find user in database
        const profile = await prisma.profile.findUnique({
            where: {
                userId: Number(userId),
            },
        });

        //if there is no match return null
        if(!profile) return null;

        return {
            ...profile,
            isMyProfile,
        };
    },

    posts: (_: any, __: any, { prisma }: Context) => {

        //find all posts and order by the date they were created
        return prisma.post.findMany({
            orderBy: [
                {
                    createdAt: "desc"
                },
            ]
        });
    },

};