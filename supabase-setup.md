# Supabase setup for patient accounts

The website remains public. Supabase login is required only when a visitor submits the appointment form. Signed-in users can open `dashboard.html` to see their own requests and booking notifications.

1. Create a Supabase project and enable email/password sign-in under **Authentication → Providers**.
2. In **Authentication → URL Configuration**, add the deployed website's `index.html` URL (including its `?auth=...` query strings) to the redirect allow list. If Supabase rejects query strings in the allow list, allow the deployed website directory URL with a wildcard query pattern. Password reset and email confirmation return to `index.html`.
3. Open **Project Settings → API** and copy the **Project URL** and the browser-safe **publishable key** (or legacy anon key) into `supabase-config.js`.
4. In **SQL Editor**, run `supabase-setup.sql` first. Then run `supabase-dashboard-setup.sql` to enable patient profiles, private profile-photo uploads, appointment IDs, and followed doctors.
5. Run `supabase-reminders-setup.sql` to create the private per-user appointment-reminder and account-notification tables. It creates a welcome notification for existing accounts once and for each new account; the dashboard also creates one appointment reminder 24 hours before each visit. Each notification stores and displays its sent date and time.
6. Serve the site over HTTPS. The Supabase JavaScript client is loaded from the CDN in `index.html` and `dashboard.html`.

The booking flow first saves the user's request in Supabase, then sends it to the existing appointment Google Sheet endpoint. The dashboard shows the request as **Request received** until the hospital confirms it. The bell lists appointment requests and reminders and marks them read when opened. Appointment reminders are created while the patient dashboard is open; browser or push notifications while the website is closed need a separate push-notification setup. Password reset is available from the sign-in form.
