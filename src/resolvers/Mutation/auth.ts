import { Context } from "../../index";
import validator from "validator";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { JSON_SIGNATURE } from "../../keys";

interface SignupArgs {
    credentials: {
        email: string;
        password: string;
    }
    name: string;
    bio: string;
}

interface SigninArgs {
    credentials: {
        email: string;
        password: string;
    };
}

interface UserPayload {
    userErrors: {
        message: string
    }[];
    token: string | null;
}

export const authResolvers = {
    signup: async (
        _: any, 
        { credentials, name, bio }: SignupArgs, 
        { prisma }: Context
        ): Promise<UserPayload> => {
        
        //get email and password from credentials
        const { email, password } = credentials;

        //validate email
        const isEmail = validator.isEmail(email)
        
        if(!isEmail) {
            return {
                userErrors: [{
                    message: "Invalid email"
                }],
                token: null,
            }
        }

        //validate if password is at least 5 characters in length
        const isValidPassword = validator.isLength(password, {
            min: 5
        })

        if (!isValidPassword) {
            return {
                userErrors: [
                    {
                        message: "Invalid password",
                    }
                ],
                token:null
            }
        }

        //validate name and bio
        if(!name || !bio) {
            return {
                userErrors: [
                    {
                         message: "Invalid name or bio",
                    },
                ],
                token: null,
            };
        }

        //hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user in prisma database, save into a variable to use for web token
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        //create user profile in database
        await prisma.profile.create({
            data: {
                bio,
                userId: user.id,
            },
        })

        //create json web token with json signature and return it
        return {
            userErrors: [],
            token: JWT.sign({
                userId: user.id,
            }, JSON_SIGNATURE, {
                expiresIn: 3600000,
            })
        };
    },

    signin: async (        
        _: any, 
        { credentials}: SigninArgs, 
        { prisma }: Context
        ): Promise<UserPayload> => {

            //extract the email and password from the credentials
            const { email, password } = credentials;
        
            //find user with provided email
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            })

            //if user is not found in db, return message
            if(!user) {
                return {
                    userErrors: [
                        {
                            message: "Invalid credentials"
                        }
                    ],
                    token: null
                }
            }

            //verify the password, returns true or false
           const isMatch = await bcrypt.compare(password, user.password)

           //if password does not match
           if(!isMatch) {
            return {
                userErrors: [
                    {
                        message: "Invalid credentials"
                    }
                ],
                token: null
                };
            }

            //create json web token with json signature and return it
            return {
               userErrors: [],
               token: JWT.sign({userId: user.id}, JSON_SIGNATURE, {
                expiresIn: 3600000,
               })
           }
    },
};