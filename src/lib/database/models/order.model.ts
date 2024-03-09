import { Document, Schema, model, models } from 'mongoose';

export interface IOrder extends Document {
  datePlaced: Date;
  stripeId: string;
  totalAmount: string;
  event: {
    _id: string;
    title: string;
  };
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  buyer: string;
  dateCreated: Date;
  eventTitle: string;
  eventId: string;
};

const OrderSchema = new Schema({
  datePlaced: { type: Date, default: Date.now },
  stripeId: { type: String, required: true, unique: true },
  totalAmount: { type: String },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;
