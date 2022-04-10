import { Context } from "..";

interface ProfileParentType {
    id: number;
    bio: string;
    userId: number;
}

export const Profile = {
    user: (parent: any, __: any, { userInfo, prisma }: Context) => {        

        //return user with the matching id
        return prisma.user.findUnique({
            where: {
                id: parent.userId,
            }
        })
    },
};