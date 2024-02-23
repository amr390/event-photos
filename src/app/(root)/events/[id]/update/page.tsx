import EventForm from '@/components/forms/EventForm';
import { getEventById } from '@/lib/actions/event.actions';
import { auth } from '@clerk/nextjs';

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  // const { sessionClaims } = auth();
  const { userId } = auth();
  const event = await getEventById(id);

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bgf-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>

      <EventForm
        userId={userId!}
        eventId={event._id}
        event={event}
        type="Update"
      />
    </>
  );
}
