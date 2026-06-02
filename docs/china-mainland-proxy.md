# China Mainland Proxy Notes

The public workflows do not include proxy settings. That is intentional.

For overseas users, the n8n server usually connects to CoreClaw directly. For users running n8n from mainland China, the n8n server process may need an outbound proxy to reach CoreClaw and n8n license or package endpoints reliably.

## Recommended Boundary

Keep proxy configuration outside the workflow JSON:

- Set proxy variables in the n8n process environment.
- Do not hardcode `127.0.0.1`, proxy ports, or local proxy software names in shared workflows.
- Do not store proxy configuration in Code nodes.
- Document proxy setup per deployment platform instead.

## Example for Local Windows Self-Hosted n8n

Use your own proxy address and port:

```powershell
$env:HTTP_PROXY = 'http://127.0.0.1:PORT'
$env:HTTPS_PROXY = 'http://127.0.0.1:PORT'
npx n8n start
```

If your environment also needs a dedicated proxy for license activation, configure it in the same launcher script used to start n8n. Keep that launcher outside this public workflow repository.

## What Not to Publish

Do not publish:

- Local proxy ports.
- Local file paths.
- Local `.n8n` user folders.
- CoreClaw API keys.
- n8n credential names or IDs from a real instance.
- Historical `run_slug` values from customer runs.
