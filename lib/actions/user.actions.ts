"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({userId, username, name, bio, image, path,}: Params): Promise<void> { // pass the entire object then destructure it in the function by name - makes code less error prone
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            { 
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true } // means update and insert - is a database operation that will update an existing row if a specified value exists in a table, and insert a new row if the specified value doesn't already exist
        );
    
        if (path == '/profile/edit') {
            revalidatePath(path); // a nextjs function that allows you to revalidate data associated with a specific path. This is useful for scenarios wherey you want to update your cached data without waitin for a revalidation period to expire.
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}