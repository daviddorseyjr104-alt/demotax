# Connect Microsoft 365 — Quick Setup (for Reg)

This lets the Tax Strategy Hub show **your** email counts and open **your**
client folders. A few important safety facts first:

- The app only ever **reads** — it can't send, change, or delete anything.
- It uses **your** Microsoft sign-in. Nobody sees or stores your password.
- **No secret to share.** Set up this way, you send back only two non-sensitive
  IDs — there is no password/secret for anyone else to hold.
- Your data stays inside **your** Microsoft account.
- You can **revoke** access anytime at https://myapps.microsoft.com → the app → Remove.

You do this once. It takes about 5 minutes.

---

## Step 1 — Register the app (one time)

1. Go to **https://portal.azure.com** and sign in with your work Microsoft account.
2. In the top search bar, type **App registrations** and open it.
3. Click **+ New registration**.
   - **Name:** `Tax Strategy Hub`
   - **Supported account types:** choose **"Accounts in this organizational
     directory only"** (most secure — only your company can use it).
   - Leave Redirect URI blank for now. Click **Register**.

## Step 2 — Add the redirect address (no-secret mode)

1. In the app you just created, click **Authentication** (left menu).
2. Click **+ Add a platform → Mobile and desktop applications**.
3. Under **Custom redirect URIs**, add **both** (add the second once the app is
   online — ask David for the live address):
   - `http://localhost:6085/api/auth/microsoft/callback`
   - `https://YOUR-LIVE-SITE/api/auth/microsoft/callback`
4. Click **Configure**.
5. Scroll down to **Advanced settings → Allow public client flows** and switch it
   to **Yes**. Click **Save**. *(This is what lets it work without a secret.)*

## Step 3 — Choose what it can read

1. Click **API permissions** (left menu) → **+ Add a permission**.
2. Pick **Microsoft Graph → Delegated permissions**.
3. Check these four, then **Add permissions**:
   - `User.Read`
   - `Mail.Read`
   - `Files.Read.All`
   - `offline_access`
4. Click **Grant admin consent for <your company>** (the button above the list),
   then **Yes**. *(If you're not an admin, your IT person clicks this.)*

## Step 4 — Send David two things (no secret!)

From the app's **Overview** page (left menu):

| Send this | Where to find it | Sensitive? |
|---|---|---|
| **Application (client) ID** | Overview page | No — safe to share |
| **Directory (tenant) ID** | Overview page | No — safe to share |

That's it. There's **no client secret** in this setup, so there's nothing
password-like to hand over. David drops those two IDs into the app, restarts it,
and then **you** open the Client Hub, click **"Connect Microsoft 365,"** and sign
in with your account. Done.

---

### If Azure gives you trouble with the no-secret steps (fallback)

Some company tenants lock down public-client apps. If sign-in errors out, do this
instead and you *still* never share a secret with anyone:

1. In **Authentication**, also add a **Web** platform with the same redirect URIs.
2. In **Certificates & secrets → + New client secret**, create one and copy the
   **Value**.
3. **You (or David) paste that secret straight into the hosting settings** (Vercel
   → Project → Settings → Environment Variables → `MS_CLIENT_SECRET`). Entered
   there, it's never sent through chat or seen by anyone else.
