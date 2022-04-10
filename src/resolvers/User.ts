import { Context } from "..";

interface UserParentType {
    id: number;
}

export const User = {
    posts: (parent: UserParentType, __: any, { userInfo, prisma }: Context) => {        
        const isOwnProfile = parent.id === userInfo?.userId

        //if it is users own profile, show all posts
        if(!isOwnProfile) {
            return prisma.post.findMany({
                where: {
                    authorId: parent.id
                },
                orderBy: [
                    {
                        createdAt: "desc"
                    }
                ]
            })
        //if profile is not the viewers, only show published posts
        } else {
            return prisma.post.findMany({
                where: {
                    authorId: parent.id,
                },
                orderBy: [
                    {
                        createdAt: "desc"
                    }
                ]
            })
        }
    },
};