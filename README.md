# Seven Steps website

Your website uses one domain and one homepage at `/`. Feature two assignments there and open each at `/stories/<id>/`. The build generates an archive at `/stories/` once you have more than two published stories. Share the homepage as the main entry point.

The current review keeps two placeholder stories and a checklist for adding your photos and text. Its enquiry form does not send messages. The checklist is for review and stays out of the public website.

[Download the review ZIP](review/owner-review.zip) or [read the review instructions](review/README.md).

## Run the site

Install Node **22.23.2** with npm **10.9.8**, then run these commands from the repository root:

```sh
cd site
npm ci --ignore-scripts
npm run build
npm run preview
```

Open [localhost:4321](http://127.0.0.1:4321/) on the same computer. Use `npm run dev` while editing. The ports used for preview and tests are developer tools, not separate public websites.

## Make changes

| Task | Guide |
|---|---|
| Edit text, add photos or set up the project | [Maintainer guide](docs/MAINTAINER-GUIDE.md) |
| Change colours, fonts, spacing or motion | [Design system](docs/DESIGN-SYSTEM.md) |
| Continue with Claude or Codex | [AI handoff](docs/AI-HANDOFF.md) |
| Prepare your photos and website details | [Content checklist](docs/OWNER-INPUTS.md) |
| Add a story or choose the two homepage features | [Public content guide](site/content/README.md#add-a-story-and-choose-the-homepage-features) |
| Publish the site and manage enquiries | [Launch guide](docs/LAUNCH.md) |
| Review enquiries and bookings | [Enquiry register](docs/MEASUREMENT.md) |

The site uses Astro, TypeScript and native CSS. You edit files in `site/`; there is no browser-based editor. The maintainer guide includes the file map, package versions and test commands.

Keep changes on `feat/sevensteps-rebuild`. The earlier HTML drafts are in `website/`. Use [the Git guide](docs/GIT-WORKFLOW.md) to save or undo a change.

## Review and publish

Share [this branch](https://github.com/swapnalihinukale/sevensteps-website/tree/feat/sevensteps-rebuild) for the code, guides and saved ZIP. A GitHub file link does not open a running website. [Preview sharing](docs/PREVIEW-SHARING.md) explains the hosting option for later.

Before launch, add and check your photos, finish the remaining device and screen-reader checks, and test your chosen enquiry destination. The developer also needs to finish the preview path for real content. See the [work plan](EXECUTION-PLAN.md) for the remaining tasks and the [test record](docs/OWNER-HANDOFF-VERIFICATION-2026-10-15.md) for completed checks.
