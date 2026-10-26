# Contact form mail: Gmail API with OAuth (send-only)

The contact form sends through the Gmail API as `info@mickeymullin.com`, which is an alias of the Workspace user `mickey@mickeymullin.com`. It authenticates with an OAuth refresh token limited to the `gmail.send` scope. That token can send mail as that user, but it can't read, change, or delete anything in the mailbox. An app password would open the whole mailbox over IMAP, so we don't use one.

The SMTP variables (`SMTP_*`) still work as a fallback. If any `GMAIL_*` variable is set, the app uses the Gmail API and ignores SMTP. If one of the three `GMAIL_*` variables is missing, the form answers 503 with the email fallback rather than falling back to SMTP.

## Values

| Thing | Value |
| --- | --- |
| Google account | `mickey@mickeymullin.com` (Workspace super admin) |
| Cloud project | `mickeymullin-website`, in the `mickeymullin.com` organization |
| API | Gmail API |
| OAuth audience | **Internal** (only mickeymullin.com accounts; no Google review; tokens don't expire after 7 days) |
| App name | `MickeyMullin.com contact form` |
| Scope | `https://www.googleapis.com/auth/gmail.send` only |
| OAuth client | type **Desktop app**, name `mickeymullin.com contact form` |
| Local files | `~/.config/mickeymullin-gmail/client_secret.json` and `token.json` (mode 600) |
| hPanel variables | `CONTACT_TO`, `CONTACT_FROM` = `info@mickeymullin.com`; `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` |

## One-time setup

### Mickey: Google Cloud (about 10 minutes)

Use Chrome signed in as `mickey@mickeymullin.com`. Check the account picture at the top right of each page.

1. **Create the project.** Open <https://console.cloud.google.com/projectcreate>. Project name: `mickeymullin-website`. Organization and Location: `mickeymullin.com`. Click **Create**, then pick the project from the selector at the top. Every later page must show `mickeymullin-website` in that selector.
2. **Enable the Gmail API.** Open <https://console.cloud.google.com/apis/library/gmail.googleapis.com> and click **Enable**.
3. **Consent screen.** Open <https://console.cloud.google.com/auth/overview> and click **Get started**.
   - App name: `MickeyMullin.com contact form`. User support email: `mickey@mickeymullin.com`. **Next**.
   - Audience: **Internal**. **Next**. If Internal is grayed out, the project isn't in the organization: go back to step 1 and set Location to `mickeymullin.com`.
   - Contact information: `mickey@mickeymullin.com`. **Next**, tick the policy box, **Continue**, **Create**.
4. **Scope.** Open <https://console.cloud.google.com/auth/scopes>, click **Add or remove scopes**, type `gmail.send` in the filter, tick `.../auth/gmail.send`, click **Update**, then **Save**. (Internal apps don't strictly need this, but it records what the app is for.)
5. **OAuth client.** Open <https://console.cloud.google.com/auth/clients>, click **Create client**. Application type: **Desktop app**. Name: `mickeymullin.com contact form`. Click **Create**. In the dialog that follows, click **Download JSON** before closing it, because Google shows the secret only once.
6. **Hand the file over.** Run `open ~/.config/mickeymullin-gmail` (Luci does this) and drag the downloaded `client_secret_….json` from Downloads into that window. Don't paste its contents anywhere.

### Mickey: Gmail "Send mail as"

In Gmail as `mickey@`: Settings (gear) → **See all settings** → **Accounts** → **Send mail as**. `info@mickeymullin.com` must be listed. If it isn't, click **Add another email address**, enter `Mickey Mullin` and `info@mickeymullin.com`, keep **Treat as an alias** ticked, and save. Without it, Gmail rewrites the From line to `mickey@`.

### Luci: get the token and test it

```sh
cd ~/dev/mickeymullin.com
mv ~/.config/mickeymullin-gmail/client_secret_*.json ~/.config/mickeymullin-gmail/client_secret.json
bun scripts/gmail-oauth.ts authorize    # opens Google sign-in in the browser
bun scripts/gmail-oauth.ts test-send    # one labeled message to info@
```

During `authorize`, Mickey picks `mickey@mickeymullin.com` and clicks **Allow** on "MickeyMullin.com contact form wants to send email on your behalf". The tab then says "Done". The script refuses the token unless `gmail.send` is the only scope granted.

`test-send` must arrive in the inbox from `Mickey Mullin website <info@mickeymullin.com>`. If it shows `mickey@` instead, fix "Send mail as".

### Mickey: hPanel

hPanel → Websites → mickeymullin.com → the Node.js app → **Environment variables**. Add:

| Variable | Value |
| --- | --- |
| `CONTACT_TO` | `info@mickeymullin.com` |
| `CONTACT_FROM` | `info@mickeymullin.com` |
| `GMAIL_CLIENT_ID` | from the clipboard |
| `GMAIL_CLIENT_SECRET` | from the clipboard |
| `GMAIL_REFRESH_TOKEN` | from the clipboard |
| `LOG_CLIENT_IP` | `1` (temporary, for the trust-proxy recheck) |

For each secret, run the copy command in Terminal on the Mac Studio, paste into hPanel, then do the next one:

```sh
cd ~/dev/mickeymullin.com
bun scripts/gmail-oauth.ts copy client-id
bun scripts/gmail-oauth.ts copy client-secret
bun scripts/gmail-oauth.ts copy refresh-token
```

Don't add any `SMTP_*` variables. Save, then restart the app (or redeploy). Afterwards, copy something harmless so the token isn't left on the clipboard.

## Afterwards

- Luci sends one labeled form submission and checks it arrives with `spf=pass`, `dkim=pass`, and `dmarc=pass`. The Gmail API sends from Google's servers, so SPF passes through `_spf.google.com` and DKIM is Google's `google._domainkey` signature (#686).
- The local `token.json` can stay as a backup copy of the token, or be deleted. hPanel is the copy that matters.

## Revoking or rotating

- **Revoke:** <https://myaccount.google.com/connections> as `mickey@` → `MickeyMullin.com contact form` → **Delete all connections**. The form then answers 502 ("sending failed") until a new token is set.
- **Rotate:** run `authorize` again, then replace `GMAIL_REFRESH_TOKEN` in hPanel and restart.
- Changing the `mickey@` Google password may revoke the token. If the form starts failing with `invalid_grant` in the runtime log, rotate.
- **Client secret:** to rotate it, add a new secret on the client in Cloud Console, update `GMAIL_CLIENT_SECRET` and `client_secret.json`, restart, then disable the old secret.

## Troubleshooting

- `Error 403: org_internal` or "Access blocked" during consent: you signed in with an account outside mickeymullin.com. Pick `mickey@`.
- "This app is blocked" during consent: Workspace Admin → Security → Access and data control → **API controls** is blocking unconfigured apps. Under **Settings**, tick "Trust internal, domain-owned apps", or mark the app Trusted under **Manage Third-Party App Access**.
- `authorize` says "no refresh token": remove the app at myaccount.google.com/connections and run it again (the script already asks for `prompt=consent`).
- Runtime log shows `Gmail API send failed: HTTP 403 (... insufficient authentication scopes)`: the token was granted the wrong scope. Run `authorize` again.
- Runtime log shows `HTTP 403 (Gmail API has not been used in project ...)`: step 2 was done in a different project.
