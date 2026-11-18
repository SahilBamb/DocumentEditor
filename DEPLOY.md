# DocumentEditor launch

Production runs in the existing Vercel project document-editor at https://document-editor-nu.vercel.app. The editor is available as a bring-your-own-model-key preview. The review guide, features, docs and homepage are indexable. The editor route has noindex.

Run npm ci and npm run build, then deploy to the existing project. The GitHub workflow checks each source update. Before offering paid plans, connect authenticated accounts to a server-side source of subscription entitlements and verify Stripe checkout, its signed webhook and the account-linked billing portal in test mode. The current paid routes return a clear availability status.
