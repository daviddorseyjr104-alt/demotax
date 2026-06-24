# Going Live — Client Hub Setup

The Client Hub works on sample data out of the box. To make it real, three
connections turn on live deals, live email counts, and live client folders.

There are two kinds of credentials. **You (the developer) set the app secrets once.**
**Reg just clicks "Sign in with Microsoft"** — he never pastes a personal key.

---

## 1. Microsoft 365 / Outlook + OneDrive  (one sign-in does both)

This powers: email counts (sent/received/per-person) **and** each client's folder + documents.

**You do this once (Azure Portal — portal.azure.com → "App registrations"):**

1. **New registration.** Name it "Tax Strategy Hub". Supported account types:
   *Accounts in any org directory and personal Microsoft accounts* (or single-tenant if Reg's firm is one tenant — then set `MS_TENANT_ID` to that tenant ID instead of `common`).
2. **Redirect URI** → platform **Web**, value:
   - Local: `http://localhost:6085/api/auth/microsoft/callback`
   - Production: `https://<your-vercel-domain>/api/auth/microsoft/callback`
   (Add both.)
3. **API permissions → Add → Microsoft Graph → Delegated:**
   `User.Read`, `Mail.Read`, `Files.Read.All`, `offline_access`. Click **Grant admin consent**.
4. **Certificates & secrets → New client secret.** Copy the **Value** immediately.
5. Put these in `.env.local` (and in Vercel → Settings → Environment Variables):
   ```
   MS_CLIENT_ID=<Application (client) ID>
   MS_CLIENT_SECRET=<the secret Value>
   MS_TENANT_ID=common
   SESSION_SECRET=<long random string — see the .env.local comment to generate>
   ```
   `SESSION_SECRET` encrypts his Microsoft tokens at rest in the cookie. Required for production.

**Reg does this:** open the Client Hub → click **Connect Microsoft 365** → approve. Done.

---

## 2. HubSpot  (live deals + contacts)

This is the one key Reg legitimately owns — it's his company's CRM.

1. HubSpot → **Settings → Integrations → Private Apps → Create**.
2. Scopes (read is enough for the Hub; write is used by other pages):
   `crm.objects.contacts.read`, `crm.objects.deals.read`
   (keep the existing `…write` ones too if you use the sync features).
3. Copy the token into `.env.local` / Vercel:
   ```
   HUBSPOT_API_KEY=<private app token>
   ```

---

## 3. Zoom  (recordings — optional)

Already scaffolded. Server-to-Server OAuth app at marketplace.zoom.us; set
`ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`.

---

## How "click client → folder" finds the right folder

By default `/api/client-files` searches Reg's OneDrive for a folder whose name
matches the client/company name (preferring an **exact** name match before any
partial), and lists its files. So name the folders after the client/company
(the "re-title the shared folder for clarity" step).

**For zero ambiguity, pin the exact folder per deal:** add a custom deal property
in HubSpot named `onedrive_folder_id` and paste the OneDrive folder's item ID into
it. The Hub then opens that exact folder and never guesses. (Folder ID = the
`id` in the folder's Graph URL, or ask and we'll add a one-click "link folder"
picker.)

---

## What's live vs. still sample after setup

| Feature | Source once connected |
|---|---|
| Client list, deal stage, amount, contact | HubSpot |
| Sent / received / sent-to-contact today | Outlook (Graph) |
| Open Folder + document list | OneDrive (Graph) |
| 7-day sent/received chart | Outlook (Graph) — real history when connected |
