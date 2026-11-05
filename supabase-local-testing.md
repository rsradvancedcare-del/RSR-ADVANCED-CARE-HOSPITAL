# Local password reset testing with Mailpit

This local Supabase project is separate from the hosted Hospital database. It captures Auth emails in Mailpit, so sign-up and password reset tests do not send mail to Gmail.

## One-time setup

1. Install Docker Desktop and the Supabase CLI on Windows, then start Docker Desktop.
2. Open PowerShell in this Hospital folder and run `supabase start`.
3. In the command output, copy the local **Project URL** and **Publishable key**. The URL is normally `http://127.0.0.1:54321`.
4. Put those values in `supabase-config.local.example.js`, then copy that file over `supabase-config.js` while testing locally.
5. Start the website at `http://localhost:5500` or `http://127.0.0.1:5500`.

## Test forgot password

1. Create a test account. Local Auth has email confirmation turned off, so it can sign in without a Gmail confirmation message.
2. Sign out. On the sign-in form, enter that account's email and choose **Forgot password?**.
3. Open Mailpit at `http://127.0.0.1:54324` and open the password recovery email.
4. Click its link. The Hospital site should open the new-password form; save the new password and then sign in with it.

## Return to the hosted project

Before deploying or testing the live project, copy `supabase-config.hosted.js` back over `supabase-config.js`. Local accounts and data stay in the local Supabase database and do not appear in the hosted project.

To stop the local services, run `supabase stop` from this folder.

If your local website uses a port other than 5500, 5501, or 3000, add its `http://localhost:<port>/**` and `http://127.0.0.1:<port>/**` addresses to `additional_redirect_urls` in `supabase/config.toml`, then restart Supabase.
