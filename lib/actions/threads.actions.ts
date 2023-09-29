"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
    try{
        connectToDB();

        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });

        // Update User Model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });

        revalidatePath(path); // make sure that the changes happen immediately on the website

    } catch(error: any) {
        throw new Error(`Error creating thread: ${error.message}`);
    }
}

    

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // Calcualte the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that have no parents (top-level real threads, threads that have comments are common threads)
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined]}})
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ 
            path: 'author', 
            model: User
        })
        .populate({ 
            path: 'children', 
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined]}});

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount * posts.length; // do we have a next page?

    return { posts, isNext };
}

export async function fetchThreadById(id: string) {
    connectToDB();

    try {
        // TODO: Populate Community

        const thread = await Thread.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: '_id id name image'
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: " _id id name parentId image"
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
                }
            ]
        }).exec();

        return thread;
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}