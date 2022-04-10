import { Post, Prisma } from "@prisma/client"
import { Context } from "../../index"
import { canUserMutatePost } from "../../utils/canUserMutatePost";

//define what we are creating
interface PostArgs {
    post: {
        title?: string;
        content?: string;
    }
}

//define what we are returning
interface PostPayloadType {
    userErrors: {
        message: string
    }[];
    post: Post | Prisma.Prisma__PostClient<Post> | null;
}

export const postResolvers = {
    postCreate: async (_: any, { post }: PostArgs,
        { prisma, userInfo }: Context): Promise<PostPayloadType> => {

            if(!userInfo) {
                return {
                    userErrors: [{
                        message: "Forbidden access (unathenticated)"
                    }],
                    post: null,
                };
            }

           //destructure post and get title and content
           const { title, content } = post

           //check if post and content are not empty
           if(!title || !content) {
               return {
                   userErrors: [
                       {
                           message: "You must provide a title and content to create a post."
                       },
                   ],
                   post: null
               };
           }
           
           return {
               userErrors: [],
               post: await prisma.post.create({
                   data: {
                       title,
                       content,
                       authorId: userInfo.userId,
                   },
               }),
           };
   },
   
   postDelete: async (
       _: any, 
       { postId }: { postId: string}, 
       { prisma, userInfo }: Context
       ): Promise<PostPayloadType> => { //with the return type added, Promise<PostPayloadType>, you get syntax on what to return
        
        if(!userInfo) {
            return {
                userErrors: [
                    {
                        message: "Forbidden access (authenticated)"
                    },
                ],
                post: null
            };
        }

        const error = await canUserMutatePost({
            userId: userInfo.userId,
            postId: Number(postId),
            prisma,
        });

       //find post by postId
       const post = await prisma.post.findUnique({
           where : {
               id: Number(postId)
           },
       });

    if(error) return error;

       //check if there is a post with the provided id, if not, return error
       if(!post) {
           return {
                userErrors: [
                   {
                       message: "Post does not exist"
                   }
               ],
               post: null
           }
       }

       //delete post
       await prisma.post.delete ({
           where: {
               id: Number(postId)
           }
       });

       return {
           userErrors: [],
           post,
       };
   },
}