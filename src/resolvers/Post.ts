import { Context } from "..";
import { userLoader } from "../loaders/userLoader";

interface PostParentType {
    authorId: number;
}

export const Post = {
    user: (parent: PostParentType, __: any, { userInfo, prisma }: Context) => {  
        //send unique ids to userLoader to lessen the api calls      
        return userLoader.load(parent.authorId)
    },
};