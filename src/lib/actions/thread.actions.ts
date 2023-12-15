"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Community from "../models/community.model";

interface Params {
  author: string;
  text: string;
  communityId: string | null;
  path: string;
}
export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Error creating thread: ${(error as Error).message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate offset
  const offset = (pageNumber - 1) * pageSize;

  // Fetch top posts (with no parent)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(offset)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      model: User,
      select: "_id name parentId image",
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > offset + posts.length;
  return { posts, isNext };
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string) {
  try {
    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not Found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined),
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()),
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== null),
    );

    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } },
    );

    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } },
    );

    revalidatePath(path);
  } catch (error) {
    throw new Error("Failed to delete thread ${(error as Error).message}");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
) {
  connectToDB();
  try {
    // Find the original thread by  its IDs
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, //set the parent id to the original thread id
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment threads id to the originals thread chilcren Array
    originalThread.children.push(savedCommentThread._id);

    await originalThread.save();

    // Invalidate server caches and refresh data
    revalidatePath(path);
  } catch (error) {
    console.error("Error while adding comment to thread", error);
    throw new Error("Unable to add comment to thread");
  }
}

export async function fetchThreadById(id: string): Promise<any> {
  connectToDB();
  try {
    const thread = await Thread.findById(id)
      .populate({ path: "author", model: User, select: "_id id name image" })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          { path: "author", model: User, select: "_id id name image" },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name image",
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error) {
    throw new Error(
      `Couldn't retrieve thread from db: ${(error as Error).message}`,
    );
  }
}
