export type UpdateUserPayload = {
  userId: string;
  username: string;
  name: string;
  bio?: string;
  image: string;
  path?: string;
};

export type CreateUserPayload = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};

export type SearchParamProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

// ==== Event params
export type CreateEventParams = {
  userId: string;
  event: {
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    categoryId: string;
    price: string;
    free: boolean;
    url: string;
  };
  path: string;
};

export type UpdateEventParams = {
  userId: string;
  event: {
    _id: string;
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    categoryId: string;
    price: string;
    free: boolean;
    url: string;
  };

  path: string;
};

export type DeleteEventParams = {
  eventId: string;
  path: string;
};

export type GetAllEventsParams = {
  query: string;
  category: string;
  limit: number;
  page: number;
};

export type GetEventsByUserParams = {
  userId: string;
  limit?: number;
  page: number;
};

export type GetRelatedEventsByCategoryParams = {
  categoryId: string;
  eventId: string;
  limit?: number;
  page: number | string;
};

export type Event = {
  _id: string;
  title: string;
  description: string;
  price: string;
  free: boolean;
  imageUrl: string;
  location: string;
  dateStart: Date;
  dateEnd: Date;
  url: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    _id: string;
    name: string;
  };
};

export type CreateCategoryParams = {
  categoryName: string;
};

// ++ Order
export type CheckoutOrderParams = {
  eventTitle: string;
  eventId: string;
  price: string;
  free: boolean;
  customerId: string;
};

export type CreateOrderParams = {
  stripeId: string;
  eventId: string;
  customerId: string;
  totalAmount: string;
  dateCreated: Date;
};

export type GetOrdersByEventParams = {
  eventId: string;
  searchString: string;
};

export type GetOrdersByUserParams = {
  userId: string;
  limit?: number;
  page: string | number | null;
};
