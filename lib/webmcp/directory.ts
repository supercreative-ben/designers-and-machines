import { EVENTS, type DemoEvent, type Speaker } from "../../data/events";
import { ATTENDEES, type Attendee } from "../../data/people";

export type Filters = {
  query?: string;
  eventId?: string;
  status?: "all" | "past" | "upcoming";
  role?: "all" | "demo_giver";
  limit?: number;
  offset?: number;
};

/** Search tolerates accents, @handles, case, and extra whitespace. */
function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/@/g, "").trim();
}

function matches(query: string | undefined, values: (string | null | undefined)[]) {
  const haystack = normalize(values.filter(Boolean).join(" "));
  return normalize(query ?? "").split(/\s+/).every((word) => haystack.includes(word));
}

function personId(person: Pick<Attendee, "handle" | "name">) {
  return person.handle ? `x:${person.handle.toLowerCase()}` : `name:${encodeURIComponent(person.name.toLowerCase())}`;
}

function profileUrl(handle: string | null) {
  return handle ? `https://x.com/${encodeURIComponent(handle)}` : null;
}

export function findEvent(id: string) {
  const event = EVENTS.find((entry) => entry.id === id);
  if (!event) throw new Error(`Unknown eventId "${id}". Use dm_list_events to find published editions.`);
  return event;
}

/** Calendar status and publication status differ when a recap is overdue. */
function status(event: DemoEvent, now: Date) {
  if (!event.upcoming) return "past";
  if (event.endsAt) return Date.parse(event.endsAt) <= now.getTime() ? "past" : "upcoming";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
  if (event.date) return event.date < today ? "past" : "upcoming";
  return event.id < today.slice(0, 7) ? "past" : "upcoming";
}

function recordedEditions(person: Attendee) {
  // A planned speaker or RSVP is not a record of past attendance.
  return person.editions.filter((id) => EVENTS.some((event) => event.id === id && !event.upcoming)).sort();
}

function attendeesFor(eventId: string) {
  return ATTENDEES.filter((person) => recordedEditions(person).includes(eventId));
}

function eventSummary(event: DemoEvent, now: Date) {
  return {
    id: event.id,
    title: event.title,
    status: status(event, now),
    date: event.date ?? null,
    startsAt: event.startsAt ?? null,
    endsAt: event.endsAt ?? null,
    timeZone: event.timeZone ?? null,
    venue: event.venue,
    venueConfirmed: event.venueConfirmed ?? null,
    registrationUrl: event.registrationUrl ?? null,
    recapPublished: !event.upcoming,
    publishedAttendeeCount: event.upcoming ? null : attendeesFor(event.id).length,
    publishedDemoCount: event.upcoming ? null : event.speakers.length,
  };
}

function demo(event: DemoEvent, speaker: Speaker) {
  return {
    id: `${event.id}/${speaker.handle.toLowerCase()}`,
    eventId: event.id,
    eventTitle: event.title,
    personId: personId(speaker),
    name: speaker.name,
    handle: speaker.handle,
    profileUrl: profileUrl(speaker.handle),
    projectName: speaker.projectName ?? null,
    projectUrl: speaker.projectUrl ?? null,
    status: event.upcoming ? "scheduled" : "presented",
  };
}

function demos() {
  return [...EVENTS].sort((a, b) => b.id.localeCompare(a.id))
    .flatMap((event) => event.speakers.map((speaker) => demo(event, speaker)));
}

function paginate<T>(items: T[], filters: Filters) {
  const limit = filters.limit ?? 25;
  const offset = filters.offset ?? 0;
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
    nextOffset: offset + limit < items.length ? offset + limit : null,
  };
}

export function listEvents(filters: Filters, now = new Date()) {
  const events = [...EVENTS].sort((a, b) => b.id.localeCompare(a.id)).filter((event) =>
    (!filters.status || filters.status === "all" || status(event, now) === filters.status) &&
    matches(filters.query, [event.id, event.title, event.date, event.venue, ...event.description ?? []])
  );
  return {
    ...paginate(events.map((event) => eventSummary(event, now)), filters),
    asOf: now.toISOString(),
    coverage: "Published editions only. Null dates, counts, or venue confirmation mean unknown or not yet published. Dates are never inferred from the edition month.",
  };
}

export function getEvent(eventId: string, now = new Date()) {
  const event = findEvent(eventId);
  return {
    ...eventSummary(event, now),
    description: event.description ?? [],
    demos: event.speakers.map((speaker) => demo(event, speaker)),
    recapUrls: event.tweets ?? [],
    attendancePublished: !event.upcoming,
    attendeesTool: { name: "dm_search_attendees", arguments: { eventId } },
    coverage: "Counts cover the public website records, not total registrations or a complete census. Use dm_search_attendees for the paginated roster. An unannounced lineup is not a confirmed absence of demos.",
  };
}

export function searchAttendees(filters: Filters) {
  if (filters.eventId) findEvent(filters.eventId);
  const presented = demos().filter((entry) => entry.status === "presented");
  const people = ATTENDEES.flatMap((person) => {
    const editions = recordedEditions(person);
    const appearances = presented.filter((entry) => entry.personId === personId(person));
    const relevantDemos = appearances.filter((entry) => !filters.eventId || entry.eventId === filters.eventId);
    if (!editions.length || (filters.eventId && !editions.includes(filters.eventId))) return [];
    if (filters.role === "demo_giver" && !relevantDemos.length) return [];
    if (!matches(filters.query, [person.name, person.handle, ...relevantDemos.flatMap((entry) => [entry.name, entry.projectName, entry.projectUrl])])) return [];
    return [{
      id: personId(person),
      name: person.name,
      handle: person.handle,
      profileUrl: profileUrl(person.handle),
      editions,
      demoEventIds: [...new Set(appearances.map((entry) => entry.eventId))].sort(),
    }];
  }).sort((a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id));
  return {
    ...paginate(people, filters),
    attendancePublished: filters.eventId ? !findEvent(filters.eventId).upcoming : true,
    coverage: "Public past-attendance records and confirmed demo givers only. People without recorded editions and planned speakers are excluded. A missing person is not proof they did not attend.",
  };
}

export function searchDemos(filters: Filters) {
  if (filters.eventId) findEvent(filters.eventId);
  const items = demos().filter((entry) =>
    (!filters.eventId || entry.eventId === filters.eventId) &&
    matches(filters.query, [entry.name, entry.handle, entry.projectName, entry.projectUrl, entry.eventTitle])
  );
  return {
    ...paginate(items, filters),
    coverage: "Published demo records only. Presented and scheduled demos are labeled separately. Missing project names or URLs are unknown; unannounced lineups and unconfirmed identities are not filled in.",
  };
}
