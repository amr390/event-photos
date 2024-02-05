import { eventDefaults } from '@/constants';
import { IEvent } from '@/lib/database/models/event.model';
import { useUploadThing } from '@/lib/uploadthing';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EventFormProps = {
  userId: string;
  type: string;
  event?: IEvent;
  eventId?: string;
};

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const initialValues =
    event && type === 'Update'
      ? {
          ...event,
          startDateTime: new Date(event.dateStart),
          endDateTime: new Date(event.dateEnd),
        }
      : eventDefaults;
  const router = useRouter();
  const { startUpload } = useUploadThing('imageUploader');

  return <></>;
};
