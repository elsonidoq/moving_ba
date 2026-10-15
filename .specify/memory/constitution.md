# BA en movimiento Constitution

## Core principles

### I. Pragmatism first

Choose the simplest approach that delivers a convincing demo. Prefer existing tools,
straightforward code, and reversible decisions over speculative abstractions or
production-grade ceremony. Plan only enough to make scope, the next action, and its
success signal clear. Resolve consequential unknowns; do not overinvestigate details
that can safely be changed after feedback.

### II. Working results early

Execution is a first-class priority in both planning and delivery. Break work into
small, visible increments and get an end-to-end demo working early. Prioritize the
shortest useful path to a demonstrable result over comprehensive infrastructure,
perfect architecture, exhaustive testing, or extensive documentation. Ask about
material blockers; otherwise continue within approved scope without unnecessary
ceremony. Polish and extend after the core experience works.

### III. Sufficient, proportionate verification

Do enough testing to establish that the demo's core journeys and changed behavior
work. Use the smallest reliable checks: focused automated tests where valuable and
browser/manual smoke checks for visible interactions. Verify relevant integration
points and add targeted regression checks when their value justifies the cost.

There is no coverage quota, mandatory test-first development, or requirement to build
a comprehensive test suite for the demo. Verification must not dominate delivery,
but known demo-breaking failures must be addressed. State what passed, failed, or
was not checked; never claim that everything works from unrun checks. Preserve
explicitly agreed acceptance criteria and mandatory workflow gates.

### IV. Documentation proportional to value

Write brief documentation needed to run the demo, understand important decisions,
recognize limitations, or resume unresolved work. Maintain affected authoritative
owners and links without duplicating narratives. Avoid exhaustive specifications,
incidental inventories, and documentation for hypothetical future systems. Favor a
working result over documentation that does not improve delivery or handoff.

### V. Demo experience matters

Prioritize a coherent, reliable presentation: clear interactions, understandable
feedback, consistent visuals, and a usable core journey. Prefer a smaller complete
experience to many unfinished features. Check the intended presentation conditions
and relevant screen sizes for affected UI; do not infer universal browser/device
support from a single demonstration.

### VI. Natural app experience

Present the application as the real product experience. In-app progress, benefits,
bookings, and other journeys may use simulated data and outcomes without labeling
them as a demo in the interface. Choose simple, reversible implementation shortcuts
that make the experience convincing. Keep engineering documentation accurate about
simulated behavior, and do not perform real external transactions or expose secrets
or personal data.

### VII. Spanish app, English engineering

All user-facing application content is in Spanish, including labels, instructions,
validation messages, accessibility text, and demo content. Code identifiers,
comments, developer-facing messages, tests, documentation, and planning artifacts
are in English. Spanish strings in code or tests are appropriate when they represent
or verify user-facing content. Preserve product names and external contract names
where necessary; this policy does not authorize an unrelated bulk rename.

## Governance

This constitution is the authoritative local product policy for demo planning and
execution. Read it before those activities. It does not authorize implementation,
install tooling, or waive owner approvals, agreed acceptance checks, focused Git
checkpoints, sensitive-data protections, or other mandatory installed workflow gates.
Where a proposed workflow conflicts with pragmatic delivery, surface the conflict
and obtain a bounded owner decision rather than silently bypassing a requirement.

Amendments require explicit owner approval. Keep changes focused, update the version
and amendment date, and maintain affected references. Increment the major version
for incompatible governance changes, minor for new/materially expanded principles,
and patch for clarifications without policy changes. Do not introduce extra review
ceremony merely to administer this policy.

## Ratification

Initial owner response through `ask_user`: **“Approve all six principles”**.
Before the initial checkpoint, the owner explicitly added: the app is in Spanish;
all other code and documentation is in English. Principle VII records that direction.
Approval covers these principles, this constitution, discoverability links in
`AGENTS.md` and `docs/README.md`, minimal indexes for its directories, policy/link
validation, and a focused owned-path commit. It does not authorize application
changes or a SpecKit installation. The proposal and answer are retained in the Pi
session; the initial policy content is retained by the Git commit introducing this
file. Pre-change baseline: `52ffd83b619362a7c8e13692d4ea91180a231e4d`.

On 2026-10-15 the owner explicitly approved replacing principle VI with “Natural
app experience” and the matching `AGENTS.md` rule in the Pi session. This is a
policy amendment, not authorization for particular app, push, or deployment changes.

**Version**: 2.0.0 | **Ratified**: 2026-10-14 | **Last amended**: 2026-10-15
