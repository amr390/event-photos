'use server';

import { CreateUserPayload, UpdateUserPayload } from '@/types';
import { currentUser } from '@clerk/nextjs/server';
import { FilterQuery, SortOrder } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDB } from '../database/';
import Community from '../database/models/community.model';
import Event from '../database/models/event.model';
import Order from '../database/models/order.model';
import Thread from '../database/models/thread.model';
import User from '../database/models/user.model';
import { handleError } from '../utils';

export async function createUser(user: CreateUserPayload) {
  try {
    await connectToDB();

    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (err) {
    handleError(err);
  }
}

export async function updateUser({
  providerId,
  username,
  name,
  bio,
  image,
  path,
}: UpdateUserPayload): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { providerId: providerId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true },
    );

    if (path === '/profile/edit') {
      revalidatePath(path);
    }
  } catch (error) {
    throw new Error(
      `Failed to create/update user: ${(error as Error).message}`,
    );
  }
}

export async function deleteUser(id: string) {
  try {
    connectToDB();

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      throw new Error('User not found');
    }

    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } },
      ),

      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } },
      ),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath('/');

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (err) {
    handleError(err);
  }
}

export async function fetchUser(userId: string | null) {
  try {
    connectToDB();
    const user = await User.findOne({ id: userId }).populate({
      path: 'communities',
      model: Community,
    });

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new Error(`Failed to fetch ussr: ${(error as Error).message}`);
  }
}

export async function fetchuserPosts(userId: string) {
  try {
    connectToDB();

    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: 'threads',
      model: Thread,
      populate: [
        {
          path: 'community',
          model: Community,
          select: 'name id image _id',
        },
        {
          path: 'children',
          model: Thread,
          populate: {
            path: 'author',
            model: User,
            select: 'name image id',
          },
        },
      ],
    });

    return threads;
  } catch (error) {
    console.error('Error fetching user thread: ', error);
    throw error;
  }
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of Users to skip based on the page number and the offset
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search expression
    const regex = new RegExp(searchString, 'i');

    // Create an initial query object to filter Users
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // exclude current user
    };

    // if the search string is not empty add the $or operator to match existing Users
    if (searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on created field
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the sesarch criteria
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error('Error fetching users: ', error);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field on each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concact(userThread.children);
    }, []);

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    return replies;
  } catch (error) {
    console.error('Failed fetching user activity', error);
    throw error;
  }
}

export async function simulateWebHook({ action }: { action: string }) {
  try {
    connectToDB();
    const user = await currentUser();
    if (action === 'create') {
      const userPayload = {
        providerId: user?.id!,
        email: user?.emailAddresses[0]?.emailAddress!,
        username: user?.username!,
        name:
          user?.firstName ||
          user?.username ||
          user?.emailAddresses[0]?.emailAddress!,
        image: user?.imageUrl!,
      };

      await createUser(userPayload);
    } else if (action === 'update') {
      const userPayload = {
        providerId: user?.id!,
        name: user?.firstName!,
        username: user?.username!,
        image: user?.imageUrl!,
      };

      await updateUser(userPayload);
    }
  } catch (error) {
    console.error(
      'Failed to simulate webhook to update db user with providerId',
      error,
    );
  }
}
