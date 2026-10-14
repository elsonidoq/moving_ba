# Architecture

## Verified repository baseline

The existing [conceptual mockup](mockup_ba_en_movimiento_v2.html) is a single HTML
file with inline CSS and JavaScript. It declares conceptual/non-official status and
fictitious class data in its visible header and notices. Its JavaScript contains
example sport/profile data, an in-memory `state` object, rendering functions, and
click handlers for simulated flows. These observations describe the file, not a
production architecture or approved product specification.

At initialization the repository contains no backend, package/build configuration,
migrations, or persistent-database schema evidence. This does not establish the
absence of systems outside the repository.

## Evidence boundaries

The source file is the evidence for the demo's structure and disclaimers. Runtime
behavior was not tested during documentation initialization. Future production
architecture, integrations, authentication, persistence, and service contracts are
not established here. Define substantive product requirements through the installed
planner and explicitly select TinySpec or Standard before such work; initialization
authorizes neither path nor implementation.
