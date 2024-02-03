'use server';

import { revalidatePath } from 'next/cache';
import Category from '../database/models/category.model';
import User from '../database/models/user.model';
import { handleError } from '../utils';
import Event, { IEvent } from '../database/models/event.model';
import {
  CreateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
  UpdateEventParams,
} from '@/types';
import { connectToDB } from '../database';
import eventsJson from '../fixtures/events.json';
import { EventDTO } from '@/constants';

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } });
};

const populateEvent = (query: any) => {
  return query
    .populate({
      path: 'owner',
      model: User,
      select: '_id firstName lastName',
    })
    .populate({ path: 'category', model: Category, select: '_id name' });
};

export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDB();

    const owner = await User.findById(userId);
    if (!owner) throw new Error('Organizer not found');

    revalidatePath(path);
    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: userId,
    });

    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    handleError(error);
  }
}

export async function getEventById(eventId: string) {
  try {
    await connectToDB();

    const event = await populateEvent(Event.findById(eventId));
    if (!event) throw new Error('Event not found');

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDB();

    const eventToUpdate = await Event.findById(event._id);

    if (!eventToUpdate || eventToUpdate.owner.toHexString() !== userId) {
      throw new Error('Unauthorized or event not found');
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true },
    );

    revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDB();

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

export async function getFixtureEvents() {
  const eventsCount = 11;
  const events: EventDTO[] = eventsJson;
  return {
    data: JSON.parse(JSON.stringify(events)),
    totalPages: eventsCount,
  };
}

export async function getAllEvents({
  query,
  limit = 6,
  page,
  category,
}: GetAllEventsParams) {
  try {
    await connectToDB();

    const titleCondition = query
      ? { title: { $regex: query, $options: 'i' } }
      : {};
    const categoryCondition = category
      ? await getCategoryByName(category)
      : null;
    const conditions = {
      $and: [
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };

    const skipAmount = (Number(page) - 1) * limit;
    const eventsQuery = Event.find(conditions)
      .sort({ dateCreated: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    console.log(error);
    // handleError(error);
  }
}

export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDB();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    const eventsQuery = Event.find(conditions)
      .sort({ dateCreated: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDB();

    const conditions = { owner: userId };
    const skipAmount = (page - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ dateCreated: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
