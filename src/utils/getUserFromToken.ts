import JWT from "jsonwebtoken"
import { JSON_SIGNATURE } from "../keys"

export const getUserFromToken = (token: string) => {
    //extra data from payload and return it
    try {
        //return an object that has a user id, that is a number, defined with typescript
        return JWT.verify(token, JSON_SIGNATURE) as {
            userId: number;
        };
    } catch (error) {
        return null;
    }
}