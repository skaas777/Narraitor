# Personal cloud deployment

This fork has an optional **single-owner private deployment** mode. All admitted
visitors use one save and one server-managed model. It is not a multi-user account
system. Vercel Authentication is the login system for this deployment.

## Deployment requirements

- Enable Vercel Authentication for **All Deployments**, including production.
- Keep the team and project restricted to the owner. Do not create shareable
  bypass links or public protection exceptions.
- Connect a **private Vercel Blob store** to the project. The SDK uses the
  deployment's short-lived OIDC token and `BLOB_STORE_ID`; no permanent storage
  key is exposed to the browser.
- Set these variables for the Production environment:
  - `NEXT_PUBLIC_PERSONAL_CLOUD=true` (public feature switch, contains no secret)
  - `PERSONAL_AI_API_KEY` (Vercel Secret)
  - `PERSONAL_AI_ENDPOINT` (full OpenAI-compatible chat completions URL)
  - `PERSONAL_AI_MODEL`
- Redeploy after changing configuration. Never enable personal mode on an
  unprotected public deployment: access control is provided by Vercel's edge,
  before application routes run.

## Saves and device changes

The initial load restores all 11 persisted game stores before mounting gameplay.
When no cloud save exists, it imports all existing IndexedDB game stores. Provider
credentials, local encryption keys, and appearance preferences are not uploaded.

Writes are compressed and debounced, with an IndexedDB copy and a durable outbox
marker for failed uploads. The banner only reports success after the storage
service acknowledges a write. Wait for “已保存到云端” before changing devices or
closing the browser. Background tabs attempt to flush pending changes.

The storage ETag is used for conditional writes; private reads skip the CDN cache.
An old tab cannot overwrite a newer cloud revision. A conflict pauses gameplay and
offers the current local branch as a download. Choosing the cloud version also
retains the displaced branch in IndexedDB under `narraitor-cloud-recovery-*`.

The server accepts at most 4 MB per compressed upload and 32 MB after decompression.
If a save exceeds these limits or connectivity fails, the UI reports pending
changes and keeps retrying; it does not claim the upload succeeded.

Model requests always resolve the secret, model and endpoint together from server
configuration. Browser headers cannot redirect the server secret. The settings
screen exposes only model metadata and a server-side connectivity test.

## Verification

The cloud route tests cover durable reads, concurrent creation, stale-write
rejection, same-origin writes, allowed store names, conditional reads, and model
credential routing. The client tests cover initial migration, a fresh device,
stale device protection, lost upload responses, and initial load failure.
