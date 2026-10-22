# Public event directory via WebMCP

The homepage registers four read-only tools after hydration. The tools query the same committed `EVENTS` and `ATTENDEES` data used by the site. No API key, login, Luma organizer access, or separate MCP server is required. This makes the directory available to a compatible browser agent while the page is open; it does not turn the site into a remote MCP endpoint.

## Tool contract

All arguments are JSON objects. Unknown fields, invalid enums, unknown event IDs, and invalid pagination return `isError: true` with an actionable message. Results use an MCP text-content envelope containing JSON, which can also be returned through the current WebMCP callback contract.

| Tool | Arguments |
| --- | --- |
| `dm_list_events` | Optional `query`, `status` (`all`, `past`, `upcoming`), `limit`, `offset`. Newest edition first. |
| `dm_get_event` | Required `eventId`, from the event list (for example `2026-09`). |
| `dm_search_attendees` | Optional `query`, `eventId`, `role` (`all`, `demo_giver`), `limit`, `offset`. Alphabetical order. |
| `dm_search_demos` | Optional `query`, `eventId`, `limit`, `offset`. Newest edition first, then published lineup order. |

Search ignores case, accents, `@`, and extra whitespace; all search words must match. Queries are limited to 200 characters. List responses include `items`, `total`, `limit`, `offset`, and `nextOffset`. Default page size is 25, maximum 50. Continue with `nextOffset` and the same filters until it is `null`.

Example calls:

```json
{"tool":"dm_list_events","arguments":{"status":"upcoming"}}
{"tool":"dm_get_event","arguments":{"eventId":"2026-09"}}
{"tool":"dm_search_attendees","arguments":{"eventId":"2026-09","role":"demo_giver"}}
{"tool":"dm_search_attendees","arguments":{"query":"@micka_design"}}
{"tool":"dm_search_demos","arguments":{"query":"Penguin"}}
```

Person IDs use a lowercase X handle where supplied, otherwise the encoded lowercase recorded name. They join attendee records with demo appearances; identity changes must still be resolved by the host. The tools do not guess that two differently recorded people are the same person.

## Coverage and maintenance

- Only public names, handles/profile links, edition memberships, event metadata, project links, and recap URLs are returned. No private guest exports, email addresses, registration answers, chat, authentication, or live presence data are read.
- Attendees come from published attendance history and confirmed past presenters. An attendee record with no completed edition is excluded. A `demo_giver` filter combined with `eventId` means the person presented at that specific edition.
- Counts describe the site's published records; they are not total RSVPs or proof of a complete census. Missing people or demos do not establish that they were absent.
- Scheduled speakers are labeled `scheduled` and are excluded from past attendance. Clearing `upcoming` after host confirmation publishes the actual lineup as `presented`, consistent with the recap workflow.
- Calendar status is separate from recap publication: an edition with `upcoming` still set becomes past after its known end time, or after its date in San Francisco when no end time exists. With only a month, it becomes past once that month ends. This does not publish its attendance or confirm its planned demos.
- Unknown dates, times, venues' confirmation state, and project names remain `null`. Upcoming/unpublished attendee and actual-demo counts remain `null`, not zero. October's venue is explicitly unconfirmed. The runbook remains the authority for unresolved event details.
- Add exact `date` (`YYYY-MM-DD`), `startsAt`/`endsAt` (ISO timestamps with offsets), `timeZone`, and `registrationUrl` to `data/events.ts` only when confirmed. Historical editions can keep missing values. Preserve historical registration URLs; keep the upcoming edition's URL consistent with `LUMA_EVENT_SLUG` and `LUMA_EMBED_URL` in `data/site.ts`.

## Browser integration

`components/WebMCP.tsx` detects `document.modelContext.registerTool` first, then the earlier `navigator.modelContext` surface. Unsupported browsers skip initialization and do not download the directory/tool bundle. There is no fake browser API or required polyfill.

Registration follows the [current WebMCP draft](https://webmachinelearning.github.io/webmcp/) and [Chrome imperative API guidance](https://developer.chrome.com/docs/ai/webmcp/imperative-api). It uses an `AbortSignal` for cleanup, and `unregisterTool` when provided by older implementations. Mounts are serialized to prevent late async registration from interfering with a remount. Host registration failures are caught and logged without breaking the website. Tools are marked read-only; returned names and linked content are data, not instructions.

Browser/agent support is required. Successful page registration alone does not prove a particular host can discover or invoke tools. Discovery should be refreshed after navigation.

## Verification

```bash
npm run test:webmcp
npx tsc --noEmit
npm run build
```

The tests check real September counts, cross-edition history, search, pagination, public-field projection, scheduled-speaker exclusion, unknown/malformed arguments, current/legacy registration, failed registrations, and remount races.

In a WebMCP-capable browser, open the local site and use native tool discovery. Confirm all four tools are present before opening the People tab, then invoke each tool with the examples above. Verify September has 35 public attendees and six demos, and October shows the published registration link with unknown attendance and an unconfirmed venue. Reload and rediscover to check that tools still work without duplicate registration errors. Also check the normal homepage in a browser without WebMCP.
