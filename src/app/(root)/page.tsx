import ThreadCard from "@/components/cards/ThreadCard";
import Collection from "@/components/shared/Collection";
import { Button } from "@/components/ui/button";
import { getAllEvents } from "@/lib/actions/event.actions";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { SearchParamProps } from "@/types";
import { currentUser } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || "";
  const category = (searchParams?.category as string) || "";

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6,
  });

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
          <h1 className="h1-bold">
            Host, Connect, Celebrate: Your Events, our Platform
          </h1>
          <p className="p-regular-20 md:p-regular-24">
            Book and learn helpful tips from 3168 Lorem ipsum dolor sit amet,
            officia excepteur ex fugiat reprehenderit enim labore culpa sint ad
            nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim
            cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum
            Lorem est aliquip amet voluptate voluptate dolor minim nulla est
            proident. Nostrud officia pariatur ut officia. Sit irure elit esse
            ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem
            duis laboris cupidatat officia voluptate. Culpa proident adipisicing
            id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua
            reprehenderit commodo ex non excepteur duis sunt velit enim.
            Voluptate laboris sint cupidatat ullamco ut ea consectetur et est
            culpa et culpa duis.{" "}
          </p>
          <Button size="lg" asChild className="button w-full sm:w-fit">
            <Link href="#events">Explore now</Link>
          </Button>
        </div>
      </section>
      <section
        id="events"
        className="wrapper my-8 flex flex-col gap-8 md:gap-12"
      >
        <h2 className="h2-bold">
          Trust by <br /> Thousands of Events{" "}
        </h2>

        <div className="flex w-full flex-col gap-5 md:flex-row">
          <Search />
          <CategoryFilter />
        </div>

        <Collection
          data={events?.data}
          emptyTitle="No Events Found"
          emptyStateSubtext="Come back later"
          collectionType="All_Events"
          limit={6}
          page={page}
          totalPages={events?.totalPages}
        />
      </section>
    </>
  );
}
