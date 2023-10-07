"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

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
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId })
            // .populate({
            //     path: 'communities',
            //     model: Community
            // })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all threads authored by user with the given userId

        // TODO: Populate Community
        const threads = await User.findOne({ id: userId })
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }
                }
            })
            return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
} : {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber -1) * pageSize; // calculate number of users to skip based on page number and page size

        const regex = new RegExp(searchString, "i"); // create a regex to search for users that match the search string

        // Filter Search Results
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId } // not equal to userId
        }

        if(searchString.trim() !== '') {
            query.$or = [
                { username: {regex: regex} },
                { name: {regex: regex} }
            ]
        }

        // Sort Search Results
        const sortOptions = { createdAt: sortBy };
        
        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);
        
        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB();
    
        // Find all threads created by the user
        const userThreads = await Thread.find({ author: userId });
    
        // Collect all the child thread ids (replies) from the 'children' field of each user thread
        const childThreadIds = userThreads.reduce((acc, userThread) => {
          return acc.concat(userThread.children);
        }, []); // default accumulator to add to the function
    
        // Find and return the child threads (replies) excluding the ones created by the same user
        const replies = await Thread.find({
          _id: { $in: childThreadIds },
          author: { $ne: userId }, // Exclude threads authored by the same user
        }).populate({
          path: "author",
          model: User,
          select: "name image _id",
        });
    
        return replies;

    } catch(error: any) {
        throw new Error(`Failed to fetch user activity: ${error.message}`);
    }
}