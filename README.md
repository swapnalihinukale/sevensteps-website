# Seven Steps website planning workspace

The private draft now lives in [site](site/README.md). Run it locally at `http://127.0.0.1:4321/` after starting the preview. The [implementation verification ledger](docs/IMPLEMENTATION-VERIFICATION-2026-10-15.md) records the current checks and remaining release work.


**The executable plan is ready. Website implementation has not started.**

Start with [EXECUTION-PLAN.md](EXECUTION-PLAN.md), then [the research synthesis and three proposed concepts](RESEARCH-SYNTHESIS-AND-CONCEPTS.md). The plan records completed research, the next decisions, future implementation tasks, dependencies and acceptance criteria.

The plan names the skills, plugins and tools to use at each stage. Apply [stop-slop](/Users/admin/.codex/skills/stop-slop/SKILL.md) and the [copy/voice rules](docs/COPY-AND-VOICE-SPEC.md) to authored prose and UX. Use no em dashes in copy, including replacement notes, error states, accessible labels and metadata.

The [architecture decisions](docs/TECHNICAL-DECISIONS.md) now select Astro static output, TypeScript and native CSS, with a separate durable receiver for a live enquiry form. The [prebuild design review](docs/PREBUILD-DESIGN-REVIEW.md) records seven findings and their later acceptance checks. Website bug fixing and final code/rendered-design review require an implementation and remain pending.

The research includes 24 reference websites, browser review of 12, and five sampled projects from the photographer's own public portfolio; one additional project required sign-in. Findings distinguish public evidence from interpretation and owner-only unknowns.

The first-version requirements are ready to execute:

- [Content replacement UX](docs/CONTENT-REPLACEMENT-UX.md) and [27-slot inventory](docs/CONTENT-SLOT-INVENTORY.md): visible Add/Replace notes, exact requests and one completion checklist.
- [Responsive and reliability specification](docs/RESPONSIVE-AND-RELIABILITY-SPEC.md): screens, browsers, operating systems, input methods and truthful enquiry behavior.
- [Motion and interaction specification](docs/MOTION-AND-INTERACTION-SPEC.md): rich transitions, arrows, scroll treatments and pausable automatic movement with efficient fallbacks.
- [Quality and security gates](docs/QUALITY-AND-SECURITY-GATES.md): dependency checks, meaningful tests, performance budgets and release evidence.

Next: choose or revise a proposed direction, then refine the prepared inventory where the scope changes. The user's no-coding boundary remains in effect until implementation is requested. Unknown assets can be clearly labelled in that later private review version.

The [Codex design adapter](.agents/skills/photographer-design-codex/SKILL.md) and pinned Anthropic/OpenDesign text guidance are installed. **OpenDesign's optional executable runtime is disabled on security hold after dependency audit.** Its earlier setup/protocol checks passed, but its dependencies are not cleared. See [the tooling guide](.design-tooling/README.md) and [audit](.design-tooling/DEPENDENCY-AUDIT-2026-10-15.md). The text-based workflow and project plan remain usable.
