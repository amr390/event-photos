import { Document, Schema, model, models } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  imageLink: string;
  dateCreated: Date;
  lastUpdated: Date;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  category: { _id: string; name: string };
  owner: { _id: string; firstName: string; lastName: string };
}

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  dateCreated: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  dateStart: { type: Date, default: Date.now },
  dateEnd: { type: Date, default: Date.now },
  price: { type: String },
  free: { type: Boolean, default: false },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Event = models.Event || model('Event', EventSchema);

export default Event;
