# Share the review

Share [the project branch](https://github.com/swapnalihinukale/sevensteps-website/tree/feat/sevensteps-rebuild). It contains the source, editing guides and [review ZIP](../review/README.md). You do not need to transfer a separate attachment.

The GitHub link opens the repository. To view the website, [run it on your computer](../site/README.md) or host the ZIP using the steps below. No hosted review URL exists yet.

## Host it on Netlify later

Use your Seven Steps Netlify account and create a separate review site. Leave the existing sites and domain in place.

1. Sign in to Netlify and choose a manual deployment.
2. Extract `review/owner-review.zip`. Upload the folder containing `index.html`.
3. Open the resulting HTTPS URL. Check the homepage, both stories, checklist filters and an unknown URL for the 404 page. Try the menu and gallery on your phone.
4. Check that the form stays disabled and that Netlify applies the included `_headers` file. The developer should verify the CSP, `X-Robots-Tag` and absence of source files or API endpoints.
5. Share that URL for feedback. Record its deploy ID and the matching ZIP hash before replacing it with another version.

Upload the extracted website files, not the repository or manifest. The repository's `netlify.toml` is for the later public release; a Git import would use that build configuration.

The review asks search engines not to index it. Anyone with an unprotected URL can still open it. If you need restricted access, check Netlify's access controls and plan before sharing.

## Give feedback

Include the page or content reference, the change you want and its priority. For a display or interaction problem, add your device, browser and a screenshot.

You can decide the layout now. Check the crops, colour and photo sequence after adding your work. Use [the content list](OWNER-INPUTS.md) as you gather it.

For another review version, regenerate the ZIP using [the package guide](REVIEW-PACKAGE.md) and upload it to the same review site. Keep its previous deploy available for rollback.
