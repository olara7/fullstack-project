import { User } from ".prisma/client"
import DataLoader from "dataloader"
import { prisma } from ".."

//return a promise, an array of users
type BatchUser = (ids: number[]) => Promise<User[]>

//batch users to make less queries and improve performance 
const batchUsers: BatchUser = async (ids) => {
    
    //get all of the users where the id is inside the id array
    const users = await prisma.user.findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });

    //create a map for the user ids
    const userMap: { [key:string]: User } = {};

    //add user ids to map
    users.forEach((user) => {
        userMap[user.id] = user;
    });

    //return ids in the same order as the userMap
    return ids.map((id) => userMap[id]);
}

//@ts-ignore
export const userLoader = new DataLoader<number, User>(batchUsers)

//create a map to organize and return the users in the same order they were received
// [1, 3, 2]

//[{id: 2}, {id: 1}, {od:3}]


// map
// {
//     1, {id: 1},
//     2, {id: 2},
//     3, {id: 3}
// }