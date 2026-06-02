# Publishing

## Can this be published only on n8n?

No. The workflow runs inside n8n, but the workflow JSON can be hosted anywhere users can access it, including GitHub.

GitHub is the right primary publishing location for this package because it provides:

- Version history.
- Reviewable pull requests.
- Raw JSON URLs that n8n can import.
- A place for docs, examples, issues, and release notes.
- A clean separation between workflow templates and the `n8n-nodes-coreclaw` npm package.

## Distribution Paths

| Path | Purpose | Notes |
| --- | --- | --- |
| GitHub repository | Primary source and public import URLs | Recommended first release path |
| n8n Import from URL | End-user import flow | Use raw GitHub workflow URLs |
| n8n template gallery | Optional broader discovery | Requires separate submission/review process |
| npm package `n8n-nodes-coreclaw` | CoreClaw node distribution | Separate from this workflow repository |

## Release Checklist

Before publishing a release:

1. Run `npm run check`.
2. Confirm workflow JSON contains no `credentials` object.
3. Confirm there are no API keys, local paths, proxy addresses, or historical run IDs.
4. Import both workflow JSON files into a clean n8n instance.
5. Select a test CoreClaw credential manually in n8n.
6. Execute a small Complete run with `max_results = 5`.
7. Confirm the summary returns `outcome = success`, a `run_slug`, result preview, and a CSV download URL.
8. Tag a GitHub release.
9. Add raw workflow URLs to the release notes and README.

## n8n Template Gallery Notes

The n8n template gallery is not the same thing as a GitHub workflow repository. Treat it as a later marketing/discovery channel after the GitHub package is stable.

If the CoreClaw community node is unverified, some n8n environments may not be able to use the template directly. In that case, prioritize improving and verifying `n8n-nodes-coreclaw` first.
