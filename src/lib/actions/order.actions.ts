import { redirect } from "next/navigation";
import { handleError } from "../utils";
import { connectToDB } from "../mongoose";
import Order from "../models/order.model";
import { isObjectIdOrHexString } from "mongoose";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = new String(process.env.STRIPE_SECRET_KEY!);

  const price = order.free ? 0 : Number(order.price);

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: price,
            product_data: {
              name: order.eventTitle,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: order.eventId,
        customerId: order.customerId,
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
    });

    redirect(session.url!);
  } catch (error) {
    handleError(error);
  }
};

export const createOrder = async (order: CreateOrderParams) => {
  try {
    connectToDB();

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      customer: order.customerId,
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {}
};

export async function getOrdersByEvent({
  searchString,
  eventId,
}: GetOrdersByEventParams) {
  try {
    await connectToDB();

    if (!eventId) throw new Error("Event ID is required");

    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          dateCreated: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          customer: {
            $concat: ["$customer.firstName", "", "$customer.lastName"],
          },
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { customer: { $regex: RegExp(searchString, "i") } },
          ],
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {}
}

export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {}
