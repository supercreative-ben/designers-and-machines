import { getEvent, listEvents, searchAttendees, searchDemos, type Filters } from "./directory";

type Property = {
  type: "string" | "integer";
  description: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  minLength?: number;
  default?: string | number;
};

export type DirectoryTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, Property>;
    required: string[];
    additionalProperties: false;
  };
  annotations: { readOnlyHint: true; untrustedContentHint: true };
  execute: (input: unknown) => Promise<{
    content: { type: "text"; text: string }[];
    isError?: boolean;
  }>;
};

const query: Property = { type: "string", description: "Case- and accent-insensitive search; all words must match. Omit to browse everything.", maxLength: 200 };
const eventId: Property = { type: "string", description: "Exact edition ID from dm_list_events, e.g. 2026-09.", minLength: 1, maxLength: 40 };
const pagination: Record<string, Property> = {
  limit: { type: "integer", description: "Maximum results per page.", minimum: 1, maximum: 50, default: 25 },
  offset: { type: "integer", description: "Zero-based offset; use nextOffset from the previous result with the same filters.", minimum: 0, maximum: 1000000, default: 0 },
};

function validate(input: unknown, schema: DirectoryTool["inputSchema"]): Filters {
  if (input === null || typeof input !== "object" || Array.isArray(input)) throw new Error("Arguments must be a JSON object.");
  const values = input as Record<string, unknown>;
  for (const name of schema.required) {
    if (!Object.hasOwn(values, name)) throw new Error(`Missing required argument: ${name}.`);
  }
  for (const [name, value] of Object.entries(values)) {
    const property = Object.hasOwn(schema.properties, name) ? schema.properties[name] : undefined;
    if (!property) throw new Error(`Unknown argument: ${name}.`);
    if (property.type === "string") {
      if (typeof value !== "string" || value.length > (property.maxLength ?? Infinity) || value.trim().length < (property.minLength ?? 0)) {
        throw new Error(`${name} must be a string of ${property.minLength ?? 0}–${property.maxLength ?? "unlimited"} characters.`);
      }
      if (property.enum && !property.enum.includes(value)) throw new Error(`${name} must be one of: ${property.enum.join(", ")}.`);
    } else if (typeof value !== "number" || !Number.isSafeInteger(value) || value < property.minimum! || value > property.maximum!) {
      throw new Error(`${name} must be an integer from ${property.minimum} to ${property.maximum}.`);
    }
  }
  return values as Filters;
}

function tool(name: string, description: string, properties: Record<string, Property>, run: (filters: Filters) => unknown, required: string[] = []): DirectoryTool {
  const inputSchema = { type: "object" as const, properties, required, additionalProperties: false as const };
  return {
    name,
    description,
    inputSchema,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      try {
        const result = run(validate(input, inputSchema));
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: JSON.stringify({ error: error instanceof Error ? error.message : "Unable to read the directory." }) }],
        };
      }
    },
  };
}

export const DIRECTORY_TOOLS: DirectoryTool[] = [
  tool("dm_list_events", "Browse Designers & Machines dinners in San Francisco, newest first. Filter past or upcoming events; get edition IDs, known dates, venues, public counts, and registration links. Published records only; null means unknown.", {
    query,
    status: { type: "string", description: "Filter by calendar status. Events remain upcoming until their published end time (or through their date when no time is known).", enum: ["all", "past", "upcoming"], default: "all" },
    ...pagination,
  }, listEvents),
  tool("dm_get_event", "Get a Designers & Machines edition's details, demos, presenter profiles, project links, recap posts, registration link, and public attendee count. Fetch its roster with dm_search_attendees. Unknown details remain null.", { eventId }, (filters) => getEvent(filters.eventId!), ["eventId"]),
  tool("dm_search_attendees", "Browse or search public past attendees by name, X handle, or demonstrated project. Filter by edition or demo_giver role. Returns profile links and attendance/demo edition history, alphabetically. Does not expose private registrations or future RSVPs.", {
    query, eventId,
    role: { type: "string", description: "demo_giver selects people who presented; with eventId this must be at that edition.", enum: ["all", "demo_giver"], default: "all" },
    ...pagination,
  }, searchAttendees),
  tool("dm_search_demos", "Find Designers & Machines demos by presenter name, X handle, project name/URL, or event title. Optionally filter by edition. Returns public project/profile links, newest editions first; labels presented versus scheduled demos.", { query, eventId, ...pagination }, searchDemos),
];
