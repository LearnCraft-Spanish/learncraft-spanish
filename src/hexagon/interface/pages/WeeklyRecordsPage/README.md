# Weekly Records Page

This page is the temporary hexagon entry point for the Weekly Records Interface refactor.

## Current Rules

- Keep this route accessible to coaches and admins.
- Do not import `src/hooks/CoachingData/useCoaching` here.
- Do not import legacy weekly records query or mutation hooks here.
- Keep `getWeeksByStartDateEndpoint` read-only until the follow-up mutation workflows are migrated.
- Do not expose create, update, or delete controls until each workflow is migrated into `src/hexagon/`.
- Preserve legacy code outside this page unless a migrated replacement fully supersedes it.

See `documentation/WEEKLY_RECORDS_INTERFACE_REFACTOR.md` before changing this page.
