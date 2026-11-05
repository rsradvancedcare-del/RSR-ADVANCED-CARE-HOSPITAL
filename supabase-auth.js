(() => {
  const config = window.HOSPITAL_SUPABASE_CONFIG || {};
  const setupNote = document.querySelector("#supabase-setup-note");
  const dialog = document.querySelector("#patient-account-dialog");
  const authForms = document.querySelector("#patient-auth-forms");
  const authModeTabs = document.querySelector("#patient-auth-mode-tabs");
  const accountTitle = document.querySelector("#patient-account-title");
  const signInForm = document.querySelector("#patient-sign-in-form");
  const signUpForm = document.querySelector("#patient-sign-up-form");
  const newPasswordForm = document.querySelector("#patient-new-password-form");
  const authStatus = document.querySelector("#patient-auth-status");
  const confirmationPanel = document.querySelector("#patient-confirmation-panel");
  const recoveryPanel = document.querySelector("#patient-recovery-panel");
  const confirmationEmail = document.querySelector("#patient-confirmation-email");
  const confirmationStatus = document.querySelector("#patient-confirmation-status");
  const recoveryEmail = document.querySelector("#patient-recovery-email");
  const recoveryStatus = document.querySelector("#patient-recovery-status");
  const recoveryCreatePasswordButton = document.querySelector("#patient-create-new-password");
  const recoveryResendButton = document.querySelector("#patient-resend-recovery");
  const accountContent = document.querySelector("#patient-account-content");
  const accountAuthPanel = document.querySelector("#patient-dashboard-auth");
  const accountName = document.querySelector("#patient-account-name");
  const appointmentList = document.querySelector("#patient-appointments-list");
  const upcomingAppointmentsList = document.querySelector("#patient-upcoming-appointments");
  const pastAppointmentsList = document.querySelector("#patient-past-appointments");
  const profileForm = document.querySelector("#patient-profile-form");
  const profileEditButton = document.querySelector("#patient-profile-edit");
  const profileCancelButton = document.querySelector("#patient-profile-cancel");
  const profilePhotoInput = document.querySelector("#patient-profile-photo");
  const profileAvatar = document.querySelector("#patient-profile-avatar");
  const profileAvatarPlaceholder = document.querySelector("#patient-profile-avatar-placeholder");
  const profileUploadLabel = document.querySelector("#patient-profile-upload-label");
  const profileActions = document.querySelector("#patient-profile-actions");
  const profileStatus = document.querySelector("#patient-profile-status");
  const notificationList = document.querySelector("#patient-notifications-list");
  const headerNotificationList = document.querySelector("#patient-header-notification-list");
  const notificationWrap = document.querySelector("#patient-notification-wrap");
  const notificationPopover = document.querySelector("#patient-notification-popover");
  const notificationButton = document.querySelector("#patient-notification-button");
  const notificationCount = document.querySelector("#appointment-notification-count");
  const tabNotificationCount = document.querySelector("#patient-notifications-tab-count");
  const appointmentsView = document.querySelector("#patient-appointments-view");
  const notificationsView = document.querySelector("#patient-notifications-view");
  const appointmentsTab = document.querySelector("#patient-appointments-tab");
  const slipTab = document.querySelector("#patient-slip-tab");
  const slipView = document.querySelector("#patient-slip-view");
  const slipLookupForm = document.querySelector("#patient-slip-lookup-form");
  const slipApplicationId = document.querySelector("#patient-slip-application-id");
  const slipTrackButton = document.querySelector("#patient-slip-track-button");
  const slipStatus = document.querySelector("#patient-slip-status");
  const slipPreview = document.querySelector("#patient-slip-preview");
  const notificationsTab = document.querySelector("#patient-notifications-tab");
  const followingTab = document.querySelector("#patient-following-tab");
  const followingView = document.querySelector("#patient-following-view");
  const followingList = document.querySelector("#patient-following-list");
  const followingCount = document.querySelector("#patient-following-count");
  const appointmentEmail = document.querySelector("#appointment-email");
  const appointmentPhone = document.querySelector("#appointment-phone");
  const appointmentName = document.querySelector("#appointment-name");
  const isDashboard = document.body.dataset.page === "dashboard";
  const pendingActionKey = "hospitalPendingAuthAction";
  const recoveryVerifiedKey = "hospitalPasswordRecoveryVerified";
  const pendingBookingKey = "hospitalPendingAppointmentDraft";
  const pendingFollowKey = "hospitalPendingFollowDoctor";
  const welcomeToastKey = "hospitalPendingWelcomeToast";
  const welcomeToastSeenKey = "hospitalWelcomeToastSeenFor";
  const createdAccountToastKey = "hospitalPendingCreatedAccountToast";
  const configured = Boolean(
    window.supabase?.createClient &&
    config.url?.startsWith("https://") &&
    !config.url.includes("YOUR_PROJECT_REF") &&
    config.publishableKey &&
    !config.publishableKey.startsWith("YOUR_")
  );

  let client = null;
  let currentUser = null;
  let appointments = [];
  let appointmentReminders = [];
  let patientNotifications = [];
  let loadingAppointments = false;
  let syncingAppointmentReminders = false;
  let latestSignupEmail = "";
  let latestRecoveryEmail = "";
  let recoveryIsVerified = false;
  let patientProfile = null;
  let patientProfilePromise = Promise.resolve();
  let trackedSlipRecord = null;
  let followedDoctors = [];
  let loadingFollowedDoctors = false;
  let selectedProfilePhoto = null;
  let countdownTimer = null;
  let lastAutoFilledPhone = "";
  let welcomeToastShownForSession = false;
  let welcomeToastKindShownForSession = "";

  function hospitalAssetUrl(fileName) {
    const projectUrl = String(config.url || "").replace(/\/+$/, "");
    const encodedPath = String(fileName).split("/").map(encodeURIComponent).join("/");
    return projectUrl
      ? `${projectUrl}/storage/v1/object/public/hospital-assets/${encodedPath}`
      : `./${encodedPath}`;
  }

  function setStatus(element, message, state = "") {
    if (!element) return;
    element.textContent = message;
    element.dataset.state = state;
  }

  function setRecoveryVerifiedUI(verified) {
    recoveryIsVerified = verified;
    recoveryCreatePasswordButton?.classList.toggle("is-waiting", !verified);
    recoveryCreatePasswordButton?.setAttribute("aria-disabled", String(!verified));
    if (recoveryResendButton) recoveryResendButton.hidden = verified;
  }

  function getFreshRecoveryMarker() {
    try {
      const marker = JSON.parse(localStorage.getItem(recoveryVerifiedKey) || "null");
      return marker && Date.now() - marker.verifiedAt < 30 * 60 * 1000 ? marker : null;
    } catch (error) {
      return null;
    }
  }

  function fillAppointmentPhone(phone) {
    if (!appointmentPhone) return;
    const currentValue = appointmentPhone.value.trim();
    if (!currentValue || currentValue === lastAutoFilledPhone) {
      appointmentPhone.value = phone || "";
    }
    lastAutoFilledPhone = phone || "";
    if (window.hospitalAuth) window.hospitalAuth.profilePhone = phone || "";
  }
  function getUserName(user) {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || "Patient";
  }

  function getWelcomeSessionId() {
    if (!currentUser?.id) return "";
    return `${currentUser.id}:${currentUser.last_sign_in_at || "current-session"}`;
  }

  function showWelcomeToast(name, kind = "login") {
    let toast = document.querySelector("#patient-welcome-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "patient-welcome-toast";
      toast.className = "patient-welcome-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      const icon = document.createElement("span");
      icon.className = "patient-welcome-toast-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "✓";
      const copy = document.createElement("span");
      copy.className = "patient-welcome-toast-copy";
      const title = document.createElement("strong");
      title.className = "patient-welcome-toast-title";
      const message = document.createElement("small");
      message.className = "patient-welcome-toast-message";
      copy.append(title, message);
      toast.append(icon, copy);
      document.body.appendChild(toast);
    }
    welcomeToastKindShownForSession = kind;
    const title = toast.querySelector(".patient-welcome-toast-title");
    const message = toast.querySelector(".patient-welcome-toast-message");
    if (title) {
      title.textContent = kind === "created"
        ? "Account created successfully"
        : kind === "password-changed"
          ? "Password changed successfully!"
          : `Welcome back, ${name || "Patient"}`;
    }
    if (message) {
      message.textContent = kind === "created"
        ? `Welcome, ${name || "Patient"}. Your account is ready and you are signed in.`
        : kind === "password-changed"
          ? "Your new password has been saved."
          : "You’re signed in and ready to continue.";
    }
    toast.classList.remove("is-visible");
    window.clearTimeout(toast.dismissTimer);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    toast.dismissTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  }

  function showCurrentUserWelcomeToast(kind = "login") {
    showWelcomeToast(patientProfile?.full_name || getUserName(currentUser), kind);
    void patientProfilePromise.then(() => {
      const toast = document.querySelector("#patient-welcome-toast");
      const title = toast?.querySelector(".patient-welcome-toast-title");
      if (title && toast.classList.contains("is-visible") && patientProfile?.full_name) {
        title.textContent = kind === "created" ? "Account created successfully" : `Welcome back, ${patientProfile.full_name}`;
      }
    });
  }

  function getPendingAction() {
    try {
      return sessionStorage.getItem(pendingActionKey) || "";
    } catch (error) {
      return "";
    }
  }

  function setPendingAction(action) {
    try {
      sessionStorage.setItem(pendingActionKey, action);
    } catch (error) {
      // The user can still sign in and continue manually if storage is unavailable.
    }
  }

  function takePendingAction() {
    const action = getPendingAction();
    try {
      sessionStorage.removeItem(pendingActionKey);
    } catch (error) {
      // Ignore unavailable session storage.
    }
    return action;
  }

  function saveAppointmentDraft(draft) {
    try {
      sessionStorage.setItem(pendingBookingKey, JSON.stringify(draft));
    } catch (error) {
      // The visitor can still refill the form if browser storage is unavailable.
    }
  }

  function savePendingFollowDoctor(doctor) {
    try { sessionStorage.setItem(pendingFollowKey, JSON.stringify(doctor)); } catch (error) { /* User can follow after signing in manually. */ }
  }

  function takePendingFollowDoctor() {
    try {
      const raw = sessionStorage.getItem(pendingFollowKey);
      sessionStorage.removeItem(pendingFollowKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }
  function takeAppointmentDraft() {
    try {
      const value = sessionStorage.getItem(pendingBookingKey);
      sessionStorage.removeItem(pendingBookingKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function hasPendingBooking() {
    return Boolean(currentUser && getPendingAction() === "book");
  }

  function consumePendingBooking() {
    if (!hasPendingBooking()) return false;
    takePendingAction();
    return true;
  }

  function indexUrl(authAction = "") {
    const url = new URL("./index.html", window.location.href);
    if (authAction) url.searchParams.set("auth", authAction);
    if (authAction === "confirmed") {
      const action = getPendingAction();
      if (["book", "dashboard", "follow"].includes(action)) url.searchParams.set("next", action);
    }
    return url.toString();
  }

  function setMode(mode) {
    if (accountAuthPanel) accountAuthPanel.hidden = false;
    if (authForms) authForms.hidden = false;
    if (signInForm) signInForm.hidden = mode !== "sign-in";
    if (signUpForm) signUpForm.hidden = mode !== "sign-up";
    if (newPasswordForm) newPasswordForm.hidden = mode !== "new-password";
    if (confirmationPanel) confirmationPanel.hidden = mode !== "confirmation";
    if (recoveryPanel) recoveryPanel.hidden = mode !== "recovery-email";
    if (accountTitle) {
      accountTitle.textContent = mode === "sign-up"
        ? "Create your account"
        : mode === "new-password"
          ? "Reset your password"
          : mode === "confirmation"
            ? "Check your email"
            : mode === "recovery-email"
              ? "Check your email"
            : "Welcome back";
    }
    if (authModeTabs) authModeTabs.hidden = !["sign-in", "sign-up"].includes(mode);
    document.querySelectorAll(".patient-auth-mode-tab").forEach((tab) => {
      const active = tab.dataset.authMode === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    if (accountContent) accountContent.hidden = true;
    if (setupNote && configured) setupNote.hidden = true;
    setStatus(authStatus, "");
  }

  function openLogin(mode = "sign-in") {
    setMode(mode);
    if (dialog && !dialog.open) dialog.showModal();
    document.querySelector("#patient-sign-in-email")?.focus({ preventScroll: true });
  }

  function goToDashboard() {
    if (currentUser) {
      window.location.assign("./dashboard.html");
      return;
    }
    setPendingAction("dashboard");
    openLogin("sign-in");
  }

  function handleSignedInAction(eventName) {
    if (!currentUser) return;
    const recoveryUrl = new URL(window.location.href);
    const recoveryHash = new URLSearchParams(recoveryUrl.hash.replace(/^#/, ""));
    const isRecoveryReturn = recoveryUrl.searchParams.get("auth") === "recovery" || recoveryHash.get("type") === "recovery";
    if (eventName === "PASSWORD_RECOVERY" || (isRecoveryReturn && ["SIGNED_IN", "INITIAL_SESSION"].includes(eventName))) {
      try { sessionStorage.removeItem(pendingActionKey); } catch (error) { /* ignore */ }
      setRecoveryVerifiedUI(true);
      try {
        localStorage.setItem(recoveryVerifiedKey, JSON.stringify({ userId: currentUser.id, verifiedAt: Date.now() }));
      } catch (error) { /* The current tab can still continue without cross-tab handoff. */ }
      if (!isDashboard) openLogin("recovery-email");
      else setMode("recovery-email");
      if (accountTitle) accountTitle.textContent = "Email verified";
      setStatus(recoveryStatus, "Your reset link is verified. Create your new password now.", "success");
      recoveryUrl.searchParams.delete("auth");
      recoveryUrl.hash = "";
      window.history.replaceState({}, document.title, recoveryUrl.toString());
      return;
    }
    if (!["SIGNED_IN", "INITIAL_SESSION"].includes(eventName)) return;

    let action = getPendingAction();
    let queuedWelcomeType = "";
    try {
      queuedWelcomeType = sessionStorage.getItem(welcomeToastKey) || "";
      if (queuedWelcomeType) sessionStorage.removeItem(welcomeToastKey);
    } catch (error) { /* Ignore unavailable session storage. */ }

    const currentUrl = new URL(window.location.href);
    const isConfirmationReturn = !isDashboard && currentUrl.searchParams.get("auth") === "confirmed";
    if (isConfirmationReturn && !action) action = "dashboard";
    const isAccountCreatedDashboardReturn = isDashboard && currentUrl.searchParams.get("accountCreated") === "1";
    let createdToastHandled = false;
    if (isAccountCreatedDashboardReturn) {
      try { localStorage.removeItem(createdAccountToastKey); } catch (error) { /* Ignore unavailable local storage. */ }
      try { sessionStorage.removeItem(welcomeToastKey); } catch (error) { /* Ignore unavailable session storage. */ }
      welcomeToastShownForSession = true;
      showCurrentUserWelcomeToast("created");
      createdToastHandled = true;
      currentUrl.searchParams.delete("accountCreated");
      window.history.replaceState({}, document.title, currentUrl.toString());
    }
    let hasPendingCreatedToast = false;
    try { hasPendingCreatedToast = !createdToastHandled && localStorage.getItem(createdAccountToastKey) === "1"; } catch (error) { /* Use the queued session toast if local storage is unavailable. */ }
    if (hasPendingCreatedToast) {
      if (action === "dashboard" && !isDashboard) {
        if (!queuedWelcomeType) queuedWelcomeType = "created";
      } else {
        try { localStorage.removeItem(createdAccountToastKey); } catch (error) { /* The toast can still be shown in memory. */ }
        welcomeToastShownForSession = true;
        const sessionId = getWelcomeSessionId();
        try { if (sessionId) sessionStorage.setItem(welcomeToastSeenKey, sessionId); } catch (error) { /* Keep the one-time guard in memory. */ }
        showCurrentUserWelcomeToast("created");
        createdToastHandled = true;
      }
    }
    if (queuedWelcomeType && !createdToastHandled) {
      welcomeToastShownForSession = true;
      const sessionId = getWelcomeSessionId();
      try { if (sessionId) sessionStorage.setItem(welcomeToastSeenKey, sessionId); } catch (error) { /* Keep the one-time guard in memory for this page view. */ }
      if (action === "dashboard") {
        try { sessionStorage.setItem(welcomeToastKey, queuedWelcomeType); } catch (error) { /* The account state remains valid if browser storage is unavailable. */ }
      } else {
        showCurrentUserWelcomeToast(queuedWelcomeType === "created" ? "created" : "login");
      }
    } else if (isConfirmationReturn && !createdToastHandled) {
      const sessionId = getWelcomeSessionId();
      try { if (sessionId) sessionStorage.setItem(welcomeToastSeenKey, sessionId); } catch (error) { /* Keep the confirmation message in memory for this page view. */ }
      welcomeToastShownForSession = true;
      if (action === "dashboard") {
        try { sessionStorage.setItem(welcomeToastKey, "created"); } catch (error) { /* The login still continues if browser storage is unavailable. */ }
      } else {
        showCurrentUserWelcomeToast("created");
      }
    } else if (eventName === "SIGNED_IN") {
      let alreadyShown = false;
      const sessionId = getWelcomeSessionId();
      try { alreadyShown = Boolean(sessionId && sessionStorage.getItem(welcomeToastSeenKey) === sessionId); } catch (error) { /* Fall back to the in-memory guard. */ }
      if (!welcomeToastShownForSession && !alreadyShown) {
        welcomeToastShownForSession = true;
        try { if (sessionId) sessionStorage.setItem(welcomeToastSeenKey, sessionId); } catch (error) { /* Fall back to the in-memory guard. */ }
        if (action === "dashboard") {
          try { sessionStorage.setItem(welcomeToastKey, "login"); } catch (error) { /* Continue to dashboard without the greeting if storage is unavailable. */ }
        } else {
          showCurrentUserWelcomeToast();
        }
      }
    }
    if (isConfirmationReturn) {
      currentUrl.searchParams.delete("auth");
      currentUrl.searchParams.delete("next");
      currentUrl.searchParams.delete("code");
      currentUrl.hash = "";
      window.history.replaceState({}, document.title, currentUrl.toString());
    }
    if (action === "dashboard") {
      takePendingAction();
      if (!isDashboard) {
        const shouldShowCreatedMessage = isConfirmationReturn || queuedWelcomeType === "created" || (() => { try { return localStorage.getItem(createdAccountToastKey) === "1"; } catch (error) { return false; } })();
        window.location.assign(shouldShowCreatedMessage ? "./dashboard.html?accountCreated=1" : "./dashboard.html");
      }
    } else if (action === "follow" && !isDashboard) {
      takePendingAction();
      const doctor = takePendingFollowDoctor();
      if (dialog?.open) dialog.close();
      if (doctor) void addDoctorFollow(doctor);
    } else if (action === "book" && !isDashboard) {
      if (dialog?.open) dialog.close();
      window.dispatchEvent(new CustomEvent("hospital:booking-authenticated"));
    } else if (!isDashboard && dialog?.open) {
      dialog.close();
    }
  }
  function friendlyError(error) {
    const message = String(error?.message || "");
    if (/invalid login credentials/i.test(message)) return "The email or password is incorrect. Please try again.";
    if (/user already registered/i.test(message)) return "An account already uses this email. Try signing in instead.";
    if (/password should be at least/i.test(message)) return "Choose a stronger password with at least 8 characters.";
    if (/email not confirmed/i.test(message)) return "Confirm your email address, then sign in again.";
    if (/network|fetch/i.test(message)) return "Check your internet connection and try again.";
    return message || "We couldn't complete that request. Please try again.";
  }

  function formatDate(value) {
    if (!value) return "Date pending";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Date pending";
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function formatDateTime(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
  }
  function makeAppointmentCard(record, isNotification = false) {
    const card = document.createElement("article");
    card.className = isNotification ? "patient-notification-card" : "patient-appointment-card";
    if (isNotification && !record.notification_read) card.classList.add("is-unread");

    const title = document.createElement("h3");
    title.textContent = isNotification ? "Appointment request received" : (record.department || "Appointment request");
    card.appendChild(title);

    const detail = document.createElement("p");
    detail.textContent = `${record.doctor || "Doctor not selected"} · ${formatDate(record.preferred_date)} at ${record.preferred_time || "time pending"}`;
    card.appendChild(detail);

    if (!isNotification) {
      const visit = document.createElement("p");
      visit.textContent = `${record.visit_type || "Visit"} · Requested ${new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(record.created_at))}`;
      card.appendChild(visit);
      if (record.reason) {
        const reason = document.createElement("p");
        reason.textContent = `Reason: ${record.reason}`;
        card.appendChild(reason);
      }
      const status = document.createElement("span");
      status.className = "patient-request-status";
      status.textContent = record.request_status || "Request received";
      card.appendChild(status);
    } else {
      const note = document.createElement("p");
      note.textContent = "The hospital will contact you to confirm your request.";
      card.append(note, makeNotificationTime(record.created_at));
    }
    return card;
  }

  function makeNotificationTime(value) {
    const time = document.createElement("p");
    time.className = "patient-notification-time";
    time.textContent = `Received ${formatDateTime(value)}`;
    return time;
  }

  function makePatientNotificationCard(notification) {
    const card = document.createElement("article");
    card.className = "patient-notification-card patient-account-notification-card";
    if (!notification.read_at) card.classList.add("is-unread");
    const title = document.createElement("h3");
    title.textContent = notification.title;
    const message = document.createElement("p");
    message.textContent = notification.message;
    card.append(title, message, makeNotificationTime(notification.created_at));
    return card;
  }

  function makeAppointmentReminderCard(reminder) {
    const card = document.createElement("article");
    card.className = "patient-notification-card patient-appointment-reminder-card";
    if (!reminder.read_at) card.classList.add("is-unread");
    const title = document.createElement("h3");
    const appointment = appointments.find((record) => record.id === reminder.appointment_id);
    const isDayBefore = reminder.reminder_type === "day_before";
    const message = document.createElement("p");
    if (isDayBefore && appointment) {
      const appointmentDay = new Date(`${appointment.preferred_date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((appointmentDay.getTime() - today.getTime()) / 86400000);
      const dayWord = daysUntil === 1 ? "tomorrow" : daysUntil === 0 ? "today" : formatDate(appointment.preferred_date);
      const dayLabel = daysUntil === 1 ? "Tomorrow" : daysUntil === 0 ? "Today" : "Upcoming";
      title.textContent = `${dayLabel}: appointment with ${appointment.doctor || "your doctor"}`;
      message.textContent = `You have an appointment ${dayWord} at ${appointment.preferred_time || "your scheduled time"}. Please bring your appointment slip and arrive at the hospital 15 minutes early.`;
    } else {
      title.textContent = reminder.title;
      message.textContent = reminder.message;
    }
    card.append(title, message, makeNotificationTime(reminder.created_at));
    return card;
  }

  function getDoctorVisitReminders() {
    if (!currentUser) return [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(tomorrow);
    const dateKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    return followedDoctors.filter((doctor) => (doctor.doctor_days || "").split(/[,/|]/).some((day) => day.trim().toLowerCase() === tomorrowName.toLowerCase()))
      .map((doctor) => ({ ...doctor, dateKey, reminderKey: `${currentUser.id}:${doctor.doctor_key}:${dateKey}` }));
  }

  function getReadDoctorReminders() {
    try { return new Set(JSON.parse(localStorage.getItem("hospitalReadDoctorReminders") || "[]")); }
    catch (error) { return new Set(); }
  }

  function getDoctorReminderSentAt(reminderKey) {
    const storageKey = `hospitalDoctorReminderTimes:${currentUser?.id || "guest"}`;
    try {
      const times = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (times[reminderKey]) return times[reminderKey];
      times[reminderKey] = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(times));
      return times[reminderKey];
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function makeDoctorReminderCard(doctor, unread = false) {
    const card = document.createElement("article");
    card.className = "patient-notification-card patient-doctor-reminder-card";
    if (unread) card.classList.add("is-unread");
    const title = document.createElement("h3");
    title.textContent = `${doctor.doctor_name} is at the hospital tomorrow`;
    const detail = document.createElement("p");
    detail.textContent = [doctor.department, doctor.doctor_days, doctor.doctor_time].filter(Boolean).join(" · ");
    card.append(title, detail, makeNotificationTime(getDoctorReminderSentAt(doctor.reminderKey)));
    return card;
  }

  function getNewestNotificationEntries(doctorReminders) {
    const entries = [
      ...patientNotifications.map((notification) => ({ kind: "patient", value: notification, sentAt: notification.created_at })),
      ...doctorReminders.map((doctor) => ({ kind: "doctor", value: doctor, sentAt: getDoctorReminderSentAt(doctor.reminderKey) })),
      ...appointmentReminders.map((reminder) => ({ kind: "reminder", value: reminder, sentAt: reminder.created_at })),
      ...appointments.map((appointment) => ({ kind: "appointment", value: appointment, sentAt: appointment.created_at }))
    ];
    return entries.sort((a, b) => {
      const timeA = Date.parse(a.sentAt || "") || 0;
      const timeB = Date.parse(b.sentAt || "") || 0;
      return timeB - timeA;
    });
  }

  function makeNotificationCard(entry, readDoctorReminders) {
    if (entry.kind === "patient") return makePatientNotificationCard(entry.value);
    if (entry.kind === "doctor") return makeDoctorReminderCard(entry.value, !readDoctorReminders.has(entry.value.reminderKey));
    if (entry.kind === "reminder") return makeAppointmentReminderCard(entry.value);
    return makeAppointmentCard(entry.value, true);
  }

  function appointmentMoment(record) {
    const [year, month, day] = String(record.preferred_date || "").split("-").map(Number);
    if (!year || !month || !day) return new Date(`${record.preferred_date}T23:59:00`);
    const start = String(record.preferred_time || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours = 23;
    let minutes = 59;
    if (start) {
      hours = Number(start[1]) % 12;
      if (start[3].toUpperCase() === "PM") hours += 12;
      minutes = Number(start[2]);
    }
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  function appointmentCode(record) {
    return record.appointment_code || `RSR-${String(record.id || "").replace(/-/g, "").toUpperCase()}`;
  }

  function appendSlipField(parent, labelText, value) {
    const field = document.createElement("div");
    field.className = "patient-slip-field";
    const label = document.createElement("span");
    label.textContent = labelText;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value || "Not provided";
    field.append(label, valueElement);
    parent.appendChild(field);
    return field;
  }

  async function signedPatientPhotoUrl(path) {
    if (!path || !client) return "";
    const { data, error } = await client.storage.from("patient-avatars").createSignedUrl(path, 3600);
    return error ? "" : (data?.signedUrl || "");
  }

  async function renderAppointmentSlip(record) {
    if (!slipPreview) return;
    const code = appointmentCode(record);
    const paper = document.createElement("article");
    paper.className = "patient-slip-paper";

    const hospitalHeader = document.createElement("header");
    hospitalHeader.className = "patient-slip-hospital-header";
    const logo = document.createElement("img");
    logo.className = "patient-slip-hospital-logo";
    logo.src = hospitalAssetUrl("logo.jpg");
    logo.alt = "RSR Advanced Care Hospital logo";
    const hospitalInfo = document.createElement("div");
    hospitalInfo.className = "patient-slip-hospital-info";
    const hospitalName = document.createElement("h3");
    hospitalName.textContent = "RSR Advanced Care Hospital";
    const hospitalAddress = document.createElement("p");
    hospitalAddress.textContent = "Sector V, Salt Lake, Kolkata, West Bengal, India";
    const hospitalContact = document.createElement("p");
    hospitalContact.textContent = "+91 1000000000 · rsradvancedcare@gmail.com";
    hospitalInfo.append(hospitalName, hospitalAddress, hospitalContact);
    const slipTitle = document.createElement("strong");
    slipTitle.className = "patient-slip-document-title";
    slipTitle.textContent = "APPOINTMENT SLIP";
    hospitalHeader.append(logo, hospitalInfo, slipTitle);
    paper.appendChild(hospitalHeader);

    const statusBanner = document.createElement("div");
    statusBanner.className = "patient-slip-status-banner";
    const statusLabel = document.createElement("span");
    statusLabel.textContent = "Application status";
    const statusValue = document.createElement("strong");
    statusValue.textContent = record.request_status || "Request received";
    statusBanner.append(statusLabel, statusValue);
    paper.appendChild(statusBanner);

    const idRow = document.createElement("div");
    idRow.className = "patient-slip-id-row";
    const idText = document.createElement("div");
    const idLabel = document.createElement("span");
    idLabel.textContent = "APPLICATION ID";
    const idValue = document.createElement("strong");
    idValue.textContent = code;
    idText.append(idLabel, idValue);
    idRow.appendChild(idText);
    paper.appendChild(idRow);

    const patientSection = document.createElement("section");
    patientSection.className = "patient-slip-section";
    const patientHeading = document.createElement("h4");
    patientHeading.textContent = "Patient details";
    const patientLayout = document.createElement("div");
    patientLayout.className = "patient-slip-patient-layout";
    const avatarUrl = await signedPatientPhotoUrl(patientProfile?.avatar_path);
    if (trackedSlipRecord?.id !== record.id) return;
    if (avatarUrl) {
      const avatar = document.createElement("img");
      avatar.className = "patient-slip-patient-photo";
      avatar.crossOrigin = "anonymous";
      avatar.dataset.patientPhotoPath = patientProfile.avatar_path;
      avatar.src = avatarUrl;
      avatar.alt = "Patient profile photo";
      avatar.addEventListener("error", () => avatar.remove(), { once: true });
      patientLayout.appendChild(avatar);
    }
    const patientFields = document.createElement("div");
    patientFields.className = "patient-slip-fields-grid";
    appendSlipField(patientFields, "Full name", patientProfile?.full_name || record.patient_name);
    appendSlipField(patientFields, "Phone", record.phone || patientProfile?.phone);
    appendSlipField(patientFields, "Email", record.email || currentUser?.email);
    appendSlipField(patientFields, "Date of birth", patientProfile?.date_of_birth ? formatDate(patientProfile.date_of_birth) : "");
    appendSlipField(patientFields, "Gender", patientProfile?.gender);
    appendSlipField(patientFields, "Blood group", patientProfile?.blood_group);
    if (patientProfile?.address) appendSlipField(patientFields, "Address", patientProfile.address);
    patientLayout.appendChild(patientFields);
    patientSection.append(patientHeading, patientLayout);
    paper.appendChild(patientSection);

    const clinicianSection = document.createElement("section");
    clinicianSection.className = "patient-slip-section";
    const clinicianHeading = document.createElement("h4");
    clinicianHeading.textContent = "Doctor details";
    const clinicianLayout = document.createElement("div");
    clinicianLayout.className = "patient-slip-doctor-layout";
    const doctorName = record.doctor || "Doctor not selected";
    const doctorPhoto = document.createElement("img");
    doctorPhoto.className = "patient-slip-doctor-photo";
    doctorPhoto.alt = `${doctorName} profile photo`;
    doctorPhoto.src = hospitalAssetUrl(`${doctorName}.jpg`);
    doctorPhoto.addEventListener("error", () => doctorPhoto.remove(), { once: true });
    clinicianLayout.appendChild(doctorPhoto);
    const doctorInfo = document.createElement("div");
    doctorInfo.className = "patient-slip-doctor-info";
    const doctorHeading = document.createElement("strong");
    doctorHeading.textContent = doctorName;
    const doctorDepartment = document.createElement("span");
    doctorDepartment.textContent = record.department || "Department not selected";
    doctorInfo.append(doctorHeading, doctorDepartment);
    clinicianLayout.appendChild(doctorInfo);
    clinicianSection.append(clinicianHeading, clinicianLayout);
    paper.appendChild(clinicianSection);

    const appointmentSection = document.createElement("section");
    appointmentSection.className = "patient-slip-section";
    const appointmentHeading = document.createElement("h4");
    appointmentHeading.textContent = "Appointment details";
    const appointmentFields = document.createElement("div");
    appointmentFields.className = "patient-slip-fields-grid patient-slip-appointment-grid";
    appendSlipField(appointmentFields, "Visit date", formatDate(record.preferred_date));
    appendSlipField(appointmentFields, "Time", record.preferred_time);
    appendSlipField(appointmentFields, "Visit type", record.visit_type);
    appendSlipField(appointmentFields, "Booked on", formatDateTime(record.created_at));
    if (record.reason) appendSlipField(appointmentFields, "Reason for visit", record.reason);
    appointmentSection.append(appointmentHeading, appointmentFields);
    paper.appendChild(appointmentSection);

    const note = document.createElement("p");
    note.className = "patient-slip-footer-note";
    note.textContent = "Please bring this slip and arrive 15 minutes early. The hospital will contact you to confirm your request.";
    paper.appendChild(note);

    const actions = document.createElement("div");
    actions.className = "patient-slip-actions";
    const printButton = document.createElement("button");
    printButton.type = "button";
    printButton.className = "patient-slip-print-button";
    printButton.textContent = "Print slip";
    printButton.addEventListener("click", openSlipPrintDialog);
    const downloadButton = document.createElement("button");
    downloadButton.type = "button";
    downloadButton.className = "patient-slip-download-button";
    downloadButton.textContent = "Download";
    downloadButton.addEventListener("click", () => downloadAppointmentSlipJpg(downloadButton, paper));
    actions.append(printButton, downloadButton);

    slipPreview.replaceChildren(paper, actions);
    slipPreview.hidden = false;
  }

  function openAppointmentDetailsDialog(card, trigger, details) {
    const dialog = document.createElement("dialog");
    dialog.className = "patient-appointment-details-dialog";
    const heading = document.createElement("div");
    heading.className = "patient-appointment-details-dialog-heading";
    const title = document.createElement("h2");
    title.textContent = "Appointment Details";
    const closeIcon = document.createElement("button");
    closeIcon.type = "button";
    closeIcon.className = "patient-appointment-details-dialog-close";
    closeIcon.setAttribute("aria-label", "Close appointment details");
    closeIcon.textContent = "×";
    closeIcon.addEventListener("click", () => dialog.close());
    heading.append(title, closeIcon);

    const content = document.createElement("div");
    content.className = "patient-appointment-details-dialog-content";
    details.hidden = false;
    content.appendChild(details);

    const footer = document.createElement("div");
    footer.className = "patient-appointment-details-dialog-footer";
    const done = document.createElement("button");
    done.type = "button";
    done.className = "patient-auth-submit";
    done.textContent = "Done";
    done.addEventListener("click", () => dialog.close());
    footer.appendChild(done);
    dialog.append(heading, content, footer);
    document.body.appendChild(dialog);
    trigger.setAttribute("aria-expanded", "true");

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      details.hidden = true;
      card.appendChild(details);
      trigger.setAttribute("aria-expanded", "false");
      dialog.remove();
      trigger.focus({ preventScroll: true });
    }, { once: true });
    dialog.showModal();
  }

  function makePatientAppointmentCard(record, isUpcoming) {
    const card = document.createElement("article");
    card.className = `patient-appointment-card${isUpcoming ? " is-upcoming" : " is-past"}`;
    const title = document.createElement("h3");
    title.textContent = record.department || "Appointment";
    card.appendChild(title);

    const bookedOn = document.createElement("p");
    bookedOn.className = "patient-appointment-booked-on";
    bookedOn.textContent = `Booked on ${formatDateTime(record.created_at)}`;
    card.appendChild(bookedOn);

    const summary = document.createElement("p");
    summary.className = "patient-appointment-summary";
    summary.textContent = `${record.doctor || "Doctor not selected"} · ${formatDate(record.preferred_date)} · ${record.preferred_time || "Time pending"}`;
    card.appendChild(summary);

    if (isUpcoming) {
      const countdown = document.createElement("p");
      countdown.className = "patient-appointment-countdown";
      countdown.dataset.countdownTarget = String(appointmentMoment(record).getTime());
      card.appendChild(countdown);
    }

    const status = document.createElement("span");
    status.className = "patient-request-status";
    status.textContent = record.request_status || "Request received";
    card.appendChild(status);

    const detailsButton = document.createElement("button");
    detailsButton.className = "patient-appointment-details-toggle";
    detailsButton.type = "button";
    detailsButton.textContent = "Appointment details";
    detailsButton.setAttribute("aria-expanded", "false");
    const details = document.createElement("div");
    details.className = "patient-appointment-details";
    details.hidden = true;
    const rows = [
      ["Appointment ID", appointmentCode(record)],
      ["Booked on", formatDateTime(record.created_at)],
      ["Patient", record.patient_name],
      ["Email", record.email],
      ["Phone", record.phone],
      ["Department", record.department],
      ["Doctor", record.doctor],
      ["Visit type", record.visit_type],
      ["Date", formatDate(record.preferred_date)],
      ["Time", record.preferred_time],
      ["Reason", record.reason || "Not provided"],
      ["Status", record.request_status || "Request received"]
    ];
    rows.forEach(([label, value]) => {
      if (!value) return;
      const line = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      line.append(strong, document.createTextNode(value));
      if (label === "Appointment ID") {
        line.classList.add("patient-appointment-code");
        const copyButton = document.createElement("button");
        copyButton.className = "patient-appointment-copy-button";
        copyButton.type = "button";
        copyButton.textContent = "Copy ID";
        copyButton.setAttribute("aria-label", `Copy appointment ID ${value}`);
        copyButton.addEventListener("click", async () => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(value);
            } else {
              const temporary = document.createElement("textarea");
              temporary.value = value;
              temporary.style.position = "fixed";
              temporary.style.opacity = "0";
              document.body.appendChild(temporary);
              temporary.select();
              document.execCommand("copy");
              temporary.remove();
            }
            copyButton.textContent = "Copied";
            window.setTimeout(() => { copyButton.textContent = "Copy ID"; }, 1800);
          } catch (error) {
            copyButton.textContent = "Could not copy";
            window.setTimeout(() => { copyButton.textContent = "Copy ID"; }, 1800);
          }
        });
        line.appendChild(copyButton);
      }
      details.appendChild(line);
    });
    detailsButton.addEventListener("click", () => {
      openAppointmentDetailsDialog(card, detailsButton, details);
    });
    card.append(detailsButton, details);
    return card;
  }

  function updateAppointmentCountdowns() {
    document.querySelectorAll("[data-countdown-target]").forEach((element) => {
      const target = Number(element.dataset.countdownTarget);
      const remaining = target - Date.now();
      if (!Number.isFinite(target) || remaining <= 0) {
        element.textContent = "Appointment time has arrived";
        return;
      }
      const totalMinutes = Math.floor(remaining / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      if (days > 1 || (days === 1 && hours > 0)) element.textContent = `${days} day${days === 1 ? "" : "s"} ${hours} hour${hours === 1 ? "" : "s"} left`;
      else if (days === 1) element.textContent = `24 hours ${minutes} minutes left`;
      else if (hours > 0) element.textContent = `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"} left`;
      else element.textContent = `${Math.max(minutes, 1)} minute${minutes === 1 ? "" : "s"} left`;
    });
  }

  function renderAppointmentGroups() {
    if (!upcomingAppointmentsList && !pastAppointmentsList) return;
    const now = Date.now();
    const upcoming = appointments.filter((record) => appointmentMoment(record).getTime() > now)
      .sort((a, b) => appointmentMoment(a) - appointmentMoment(b));
    const past = appointments.filter((record) => appointmentMoment(record).getTime() <= now)
      .sort((a, b) => appointmentMoment(b) - appointmentMoment(a));

    [[upcomingAppointmentsList, upcoming, "Your upcoming appointments will appear here."],
      [pastAppointmentsList, past, "Past appointments will appear here."]].forEach(([list, records, emptyText]) => {
      if (!list) return;
      list.replaceChildren();
      if (!records.length) {
        const empty = document.createElement("p");
        empty.className = "patient-empty-state";
        empty.textContent = loadingAppointments ? "Loading your appointments…" : emptyText;
        list.appendChild(empty);
        return;
      }
      records.forEach((record) => list.appendChild(makePatientAppointmentCard(record, list === upcomingAppointmentsList)));
    });
    updateAppointmentCountdowns();
  }

  function renderRecords() {
    renderAppointmentGroups();
    const doctorReminders = getDoctorVisitReminders();
    const readDoctorReminders = getReadDoctorReminders();
    const newestNotifications = getNewestNotificationEntries(doctorReminders);

    if (appointmentList) {
      appointmentList.replaceChildren();
      if (!appointments.length) {
        const empty = document.createElement("p");
        empty.className = "patient-empty-state";
        empty.textContent = loadingAppointments ? "Loading your appointments…" : "Your appointment requests will appear here.";
        appointmentList.appendChild(empty);
      } else {
        appointments.forEach((record) => appointmentList.appendChild(makeAppointmentCard(record)));
      }
    }

    if (notificationList) {
      notificationList.replaceChildren();
      if (!newestNotifications.length) {
        const empty = document.createElement("p");
        empty.className = "patient-empty-state";
        empty.textContent = "No notifications yet.";
        notificationList.appendChild(empty);
      } else {
        newestNotifications.forEach((entry) => notificationList.appendChild(makeNotificationCard(entry, readDoctorReminders)));
      }
    }

    if (headerNotificationList) {
      headerNotificationList.replaceChildren();
      if (!currentUser) {
        const empty = document.createElement("p");
        empty.className = "patient-empty-state";
        empty.textContent = "Sign in to see your appointment notifications.";
        headerNotificationList.appendChild(empty);
      } else if (!newestNotifications.length) {
        const empty = document.createElement("p");
        empty.className = "patient-empty-state";
        empty.textContent = loadingAppointments ? "Loading notifications…" : "No appointment notifications yet.";
        headerNotificationList.appendChild(empty);
      } else {
        newestNotifications.slice(0, 5).forEach((entry) => headerNotificationList.appendChild(makeNotificationCard(entry, readDoctorReminders)));
      }
    }

    const unread = appointments.filter((record) => !record.notification_read).length
      + appointmentReminders.filter((reminder) => !reminder.read_at).length
      + patientNotifications.filter((notification) => !notification.read_at).length
      + doctorReminders.filter((doctor) => !readDoctorReminders.has(doctor.reminderKey)).length;
    notificationButton?.classList.toggle("is-ringing", unread > 0);
    [notificationCount, tabNotificationCount].filter(Boolean).forEach((badge) => {
      badge.textContent = String(unread);
      badge.hidden = unread === 0;
    });
  }
  async function loadAppointments() {
    if (!currentUser || !client || loadingAppointments) return;
    loadingAppointments = true;
    renderRecords();
    const { data, error } = await client
      .from("appointments")
      .select("id,appointment_code,user_id,patient_name,email,phone,department,doctor,visit_type,preferred_date,preferred_time,reason,request_status,notification_read,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);
    loadingAppointments = false;

    if (error) {
      console.error("Could not load appointments:", error);
      [appointmentList, upcomingAppointmentsList, pastAppointmentsList].filter(Boolean).forEach((list) => {
        list.replaceChildren();
        const message = document.createElement("p");
        message.className = "patient-empty-state";
        message.textContent = "Appointments could not load. Check the Supabase tables, dashboard setup SQL, and RLS policies.";
        list.appendChild(message);
      });
      return;
    }
    appointments = data || [];
    await syncAppointmentReminders();
    renderRecords();
  }

  async function loadPatientNotifications() {
    if (!currentUser || !client) return;
    const { data, error } = await client.from("patient_notifications")
      .select("id,user_id,notification_type,title,message,created_at,read_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Could not load patient welcome notification. Run the updated supabase-reminders-setup.sql in Supabase:", error);
      return;
    }
    patientNotifications = data || [];
    renderRecords();
  }

  function appointmentReminderRowsDue(now = Date.now()) {
    const rows = [];
    appointments.forEach((record) => {
      const appointmentAt = appointmentMoment(record).getTime();
      if (!Number.isFinite(appointmentAt) || appointmentAt <= now) return;
      const doctor = record.doctor || "your doctor";
      const time = record.preferred_time || "your scheduled time";
      const appointmentDay = new Date(`${record.preferred_date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((appointmentDay.getTime() - today.getTime()) / 86400000);
      const dayTitle = daysUntil === 1
        ? `Tomorrow: appointment with ${doctor}`
        : daysUntil === 0 ? `Today's appointment with ${doctor}` : `Upcoming appointment with ${doctor}`;
      const reminderTypes = [
        {
          type: "day_before",
          scheduledAt: appointmentAt - 24 * 60 * 60 * 1000,
          title: dayTitle,
          message: `You have an appointment tomorrow at ${time}. Please bring your appointment slip and arrive at the hospital 15 minutes early.`
        }
      ];
      reminderTypes.forEach((reminder) => {
        if (reminder.scheduledAt <= now) {
          rows.push({
            user_id: currentUser.id,
            appointment_id: record.id,
            reminder_type: reminder.type,
            title: reminder.title,
            message: reminder.message,
            scheduled_for: new Date(reminder.scheduledAt).toISOString()
          });
        }
      });
    });
    return rows;
  }

  async function syncAppointmentReminders() {
    if (!currentUser || !client || syncingAppointmentReminders) return;
    syncingAppointmentReminders = true;
    try {
      const { data, error } = await client.from("appointment_reminders")
        .select("id,user_id,appointment_id,reminder_type,title,message,scheduled_for,created_at,read_at")
        .eq("user_id", currentUser.id)
        .eq("reminder_type", "day_before")
        .order("created_at", { ascending: false });
      if (error) throw error;
      appointmentReminders = data || [];
      const existing = new Set(appointmentReminders.map((reminder) => `${reminder.appointment_id}:${reminder.reminder_type}`));
      const dueRows = appointmentReminderRowsDue().filter((row) => !existing.has(`${row.appointment_id}:${row.reminder_type}`));
      if (dueRows.length) {
        const { error: insertError } = await client.from("appointment_reminders")
          .upsert(dueRows, { onConflict: "appointment_id,reminder_type", ignoreDuplicates: true });
        if (insertError) throw insertError;
        const { data: refreshed, error: refreshError } = await client.from("appointment_reminders")
          .select("id,user_id,appointment_id,reminder_type,title,message,scheduled_for,created_at,read_at")
          .eq("user_id", currentUser.id)
          .eq("reminder_type", "day_before")
          .order("created_at", { ascending: false });
        if (refreshError) throw refreshError;
        appointmentReminders = refreshed || [];
      }
    } catch (error) {
      console.error("Could not sync appointment reminders. Run supabase-reminders-setup.sql in Supabase:", error);
    } finally {
      syncingAppointmentReminders = false;
      renderRecords();
    }
  }

  async function markNotificationsRead() {
    if (!currentUser || !client) return;
    const reminders = getDoctorVisitReminders();
    if (reminders.length) {
      const read = getReadDoctorReminders();
      reminders.forEach((doctor) => read.add(doctor.reminderKey));
      try { localStorage.setItem("hospitalReadDoctorReminders", JSON.stringify([...read])); } catch (error) { /* ignore unavailable storage */ }
      renderRecords();
    }
    const unreadPatientNotificationIds = patientNotifications.filter((notification) => !notification.read_at).map((notification) => notification.id);
    if (unreadPatientNotificationIds.length) {
      const readAt = new Date().toISOString();
      const { error } = await client.from("patient_notifications")
        .update({ read_at: readAt })
        .in("id", unreadPatientNotificationIds)
        .eq("user_id", currentUser.id);
      if (error) console.error("Could not mark patient notifications as read:", error);
      else patientNotifications = patientNotifications.map((notification) => unreadPatientNotificationIds.includes(notification.id)
        ? { ...notification, read_at: readAt }
        : notification);
    }
    const unreadReminderIds = appointmentReminders.filter((reminder) => !reminder.read_at).map((reminder) => reminder.id);
    if (unreadReminderIds.length) {
      const readAt = new Date().toISOString();
      const { error } = await client.from("appointment_reminders")
        .update({ read_at: readAt })
        .in("id", unreadReminderIds)
        .eq("user_id", currentUser.id);
      if (error) console.error("Could not mark appointment reminders as read:", error);
      else appointmentReminders = appointmentReminders.map((reminder) => unreadReminderIds.includes(reminder.id)
        ? { ...reminder, read_at: readAt }
        : reminder);
    }
    const unreadIds = appointments.filter((record) => !record.notification_read).map((record) => record.id);
    if (!unreadIds.length) {
      renderRecords();
      return;
    }

    const { error } = await client
      .from("appointments")
      .update({ notification_read: true })
      .in("id", unreadIds)
      .eq("user_id", currentUser.id);
    if (error) {
      console.error("Could not mark notifications read:", error);
      renderRecords();
      return;
    }
    appointments = appointments.map((record) => unreadIds.includes(record.id)
      ? { ...record, notification_read: true }
      : record);
    renderRecords();
  }

  function renderFollowedDoctors() {
    if (!followingList) return;
    followingList.replaceChildren();
    if (!currentUser || !followedDoctors.length) {
      const empty = document.createElement("p");
      empty.className = "patient-empty-state";
      empty.textContent = loadingFollowedDoctors ? "Loading followed doctors…" : "Doctors you follow will appear here.";
      followingList.appendChild(empty);
    } else {
      followedDoctors.forEach((doctor) => {
        const card = document.createElement("article");
        card.className = "patient-followed-doctor-card";
        const heading = document.createElement("div");
        heading.className = "patient-followed-doctor-info";
        if (doctor.doctor_photo) {
          const photo = document.createElement("img");
          photo.className = "patient-followed-doctor-photo";
          photo.src = doctor.doctor_photo;
          photo.alt = "";
          photo.addEventListener("error", () => photo.remove(), { once: true });
          heading.appendChild(photo);
        }
        const text = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = doctor.doctor_name;
        const department = document.createElement("p");
        department.textContent = doctor.department;
        text.append(name, department);
        heading.appendChild(text);
        card.appendChild(heading);

        const schedule = document.createElement("p");
        schedule.className = "patient-followed-doctor-schedule";
        schedule.textContent = [doctor.doctor_days, doctor.doctor_time].filter(Boolean).join(" · ");
        if (schedule.textContent) card.appendChild(schedule);

        const actions = document.createElement("div");
        actions.className = "patient-followed-doctor-actions";
        const book = document.createElement("button");
        book.type = "button";
        book.className = "patient-auth-submit patient-followed-doctor-book";
        book.textContent = "Book appointment";
        book.addEventListener("click", () => {
          try {
            sessionStorage.setItem("hospitalAppointmentSelection", JSON.stringify({ department: doctor.department_key, doctor: doctor.doctor_name }));
          } catch (error) { /* The form can still be filled manually. */ }
          window.location.assign("./index.html#appointment");
        });
        const unfollow = document.createElement("button");
        unfollow.type = "button";
        unfollow.className = "patient-text-button patient-followed-doctor-unfollow";
        unfollow.setAttribute("aria-label", `Unfollow ${doctor.doctor_name}`);
        unfollow.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"></path><path d="M3.8 20c.5-3.1 2.7-4.8 6.2-4.8 1.1 0 2 .2 2.8.5"></path><path d="M16 16h6"></path></svg><span>Unfollow</span>';
        unfollow.addEventListener("click", async () => {
          unfollow.disabled = true;
          unfollow.classList.add("is-loading");
          unfollow.setAttribute("aria-busy", "true");
          try {
            await unfollowDoctor(doctor.doctor_key);
          } finally {
            unfollow.disabled = false;
            unfollow.classList.remove("is-loading");
            unfollow.removeAttribute("aria-busy");
          }
        });
        actions.append(book, unfollow);
        card.appendChild(actions);
        followingList.appendChild(card);
      });
    }
    if (followingCount) {
      followingCount.textContent = String(followedDoctors.length);
      followingCount.hidden = followedDoctors.length === 0;
    }
  }

  async function loadFollowedDoctors() {
    if (!currentUser || !client || loadingFollowedDoctors) return;
    loadingFollowedDoctors = true;
    renderFollowedDoctors();
    const { data, error } = await client.from("doctor_follows")
      .select("doctor_key,doctor_name,department,department_key,doctor_days,doctor_time,doctor_photo,followed_at")
      .eq("user_id", currentUser.id)
      .order("followed_at", { ascending: false });
    loadingFollowedDoctors = false;
    if (error) {
      console.error("Could not load followed doctors:", error);
      if (followingList) {
        followingList.replaceChildren();
        const message = document.createElement("p");
        message.className = "patient-empty-state";
        message.textContent = "Followed doctors could not load. Run the updated dashboard setup SQL in Supabase.";
        followingList.appendChild(message);
      }
      return;
    }
    followedDoctors = data || [];
    renderFollowedDoctors();
    renderRecords();
    window.dispatchEvent(new CustomEvent("hospital:doctor-follows-updated"));
  }

  async function addDoctorFollow(doctor) {
    if (!client || !currentUser || !doctor?.doctorName || !doctor?.departmentKey) return false;
    const doctorKey = doctor.doctorKey || `${doctor.departmentKey}:${doctor.doctorName}`;
    const row = {
      user_id: currentUser.id,
      doctor_key: doctorKey,
      doctor_name: doctor.doctorName,
      department: doctor.department,
      department_key: doctor.departmentKey,
      doctor_days: doctor.days || null,
      doctor_time: doctor.time || null,
      doctor_photo: doctor.photo || null
    };
    const { data, error } = await client.from("doctor_follows").upsert(row, { onConflict: "user_id,doctor_key" })
      .select("doctor_key,doctor_name,department,department_key,doctor_days,doctor_time,doctor_photo,followed_at")
      .single();
    if (error) {
      console.error("Could not follow doctor:", error);
      setStatus(authStatus, "Could not follow this doctor. Run the updated dashboard setup SQL and try again.", "error");
      return false;
    }
    followedDoctors = [data, ...followedDoctors.filter((entry) => entry.doctor_key !== data.doctor_key)];
    renderFollowedDoctors();
    renderRecords();
    window.dispatchEvent(new CustomEvent("hospital:doctor-follows-updated"));
    return true;
  }

  async function unfollowDoctor(doctorKey) {
    if (!client || !currentUser || !doctorKey) return false;
    const { error } = await client.from("doctor_follows").delete()
      .eq("user_id", currentUser.id).eq("doctor_key", doctorKey);
    if (error) {
      console.error("Could not unfollow doctor:", error);
      return false;
    }
    followedDoctors = followedDoctors.filter((doctor) => doctor.doctor_key !== doctorKey);
    renderFollowedDoctors();
    renderRecords();
    window.dispatchEvent(new CustomEvent("hospital:doctor-follows-updated"));
    return true;
  }

  async function toggleDoctorFollow(doctor) {
    if (!configured || !client) {
      openLogin("sign-in");
      setStatus(authStatus, "Supabase setup is needed to save followed doctors.", "error");
      return false;
    }
    if (!currentUser) {
      setPendingAction("follow");
      savePendingFollowDoctor(doctor);
      openLogin("sign-in");
      setStatus(authStatus, "Sign in or create an account to follow this doctor.", "info");
      return false;
    }
    const key = doctor.doctorKey || `${doctor.departmentKey}:${doctor.doctorName}`;
    if (followedDoctors.some((entry) => entry.doctor_key === key)) return unfollowDoctor(key);
    return addDoctorFollow(doctor);
  }
  function selectAccountTab(view) {
    if (!appointmentsView || !slipView || !notificationsView || !followingView) return;
    const showAppointments = view === "appointments";
    const showSlip = view === "slip";
    const showNotifications = view === "notifications";
    const showFollowing = view === "following";
    appointmentsView.hidden = !showAppointments;
    slipView.hidden = !showSlip;
    notificationsView.hidden = !showNotifications;
    followingView.hidden = !showFollowing;
    appointmentsTab?.classList.toggle("is-active", showAppointments);
    slipTab?.classList.toggle("is-active", showSlip);
    notificationsTab?.classList.toggle("is-active", showNotifications);
    followingTab?.classList.toggle("is-active", showFollowing);
    appointmentsTab?.setAttribute("aria-selected", String(showAppointments));
    slipTab?.setAttribute("aria-selected", String(showSlip));
    notificationsTab?.setAttribute("aria-selected", String(showNotifications));
    followingTab?.setAttribute("aria-selected", String(showFollowing));
    if (showNotifications) markNotificationsRead();
    if (showFollowing && !followedDoctors.length) loadFollowedDoctors();
  }

  slipLookupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentUser || !client) {
      setStatus(slipStatus, "Sign in to track an appointment slip.", "error");
      return;
    }
    const code = slipApplicationId?.value.trim().replace(/\s+/g, "").toUpperCase();
    if (!code) return;
    trackedSlipRecord = null;
    if (slipPreview) {
      slipPreview.replaceChildren();
      slipPreview.hidden = true;
    }
    if (slipTrackButton) {
      slipTrackButton.disabled = true;
      slipTrackButton.classList.add("is-loading");
      slipTrackButton.setAttribute("aria-busy", "true");
    }
    setStatus(slipStatus, "Looking up your application…", "info");
    try {
      const { data, error } = await client.from("appointments")
        .select("id,appointment_code,user_id,patient_name,email,phone,department,doctor,visit_type,preferred_date,preferred_time,reason,request_status,created_at")
        .eq("appointment_code", code)
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setStatus(slipStatus, "No appointment was found for this Application ID in your account.", "error");
        return;
      }
      trackedSlipRecord = data;
      await patientProfilePromise;
      await renderAppointmentSlip(data);
      if (trackedSlipRecord?.id === data.id) setStatus(slipStatus, "Application found. Your appointment slip is ready.", "success");
    } catch (error) {
      console.error("Could not track appointment slip:", error);
      setStatus(slipStatus, "The application could not be loaded. Please check the ID and try again.", "error");
    } finally {
      if (slipTrackButton) {
        slipTrackButton.disabled = false;
        slipTrackButton.classList.remove("is-loading");
        slipTrackButton.removeAttribute("aria-busy");
      }
    }
  });

  function openSlipPrintDialog() {
    if (!trackedSlipRecord) return;
    const previousTitle = document.title;
    document.title = `Appointment-Slip-${appointmentCode(trackedSlipRecord)}`;
    window.print();
    document.title = previousTitle;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Could not read the photo."));
      reader.readAsDataURL(blob);
    });
  }

  async function getSlipImageDataUrl(image, storagePath = "") {
    if (storagePath && client) {
      try {
        const { data, error } = await client.storage.from("patient-avatars").download(storagePath);
        if (!error && data) return await blobToDataUrl(data);
      } catch (error) {
        console.warn("Could not fetch the saved patient photo for the slip:", error);
      }
    }
    if (!image) return "";
    try {
      if (image.src.startsWith("data:")) return image.src;
      const response = await fetch(image.currentSrc || image.src, { mode: "cors", cache: "force-cache" });
      if (response.ok) return await blobToDataUrl(await response.blob());
    } catch (error) {
      /* Try copying the already displayed, same-origin image below. */
    }
    try {
      if (!image.complete || !image.naturalWidth) {
        await new Promise((resolve) => {
          const finish = () => resolve();
          image.addEventListener("load", finish, { once: true });
          image.addEventListener("error", finish, { once: true });
          window.setTimeout(finish, 5000);
        });
      }
      if (!image.naturalWidth) return "";
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = image.naturalWidth;
      sourceCanvas.height = image.naturalHeight;
      const sourceContext = sourceCanvas.getContext("2d");
      if (!sourceContext) return "";
      sourceContext.drawImage(image, 0, 0);
      return sourceCanvas.toDataURL("image/png");
    } catch (error) {
      console.warn("Could not embed a slip photo:", error);
      return "";
    }
  }

  async function getDoctorSlipPhotoDataUrl(doctorName, image) {
    const originalName = String(doctorName || "").trim();
    const withoutTitle = originalName.replace(/^dr\.?\s*/i, "").trim();
    const candidates = [originalName];
    if (withoutTitle && withoutTitle !== originalName) candidates.push(withoutTitle);
    else if (withoutTitle) candidates.push(`Dr. ${withoutTitle}`);

    const displayedImage = await getSlipImageDataUrl(image);
    if (displayedImage) return displayedImage;

    for (const name of [...new Set(candidates.filter(Boolean))]) {
      try {
        const response = await fetch(hospitalAssetUrl(`${name}.jpg`), { mode: "cors", cache: "no-store" });
        if (response.ok) return await blobToDataUrl(await response.blob());
      } catch (error) {
        /* Try the next known filename form. */
      }
    }
    return "";
  }

  function loadSlipImage(dataUrl) {
    if (!dataUrl) return Promise.resolve(null);
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });
  }

  function slipRoundRect(context, x, y, width, height, radius, fill, stroke = "") {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.strokeStyle = stroke; context.lineWidth = 1; context.stroke(); }
  }

  function slipWrappedText(context, value, x, y, maxWidth, lineHeight, maxLines = 2) {
    const words = String(value || "Not provided").split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    const visible = lines.slice(0, maxLines);
    if (lines.length > maxLines && visible.length) {
      let last = visible[visible.length - 1];
      while (last && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      visible[visible.length - 1] = `${last.trimEnd()}…`;
    }
    visible.forEach((text, index) => context.fillText(text, x, y + index * lineHeight));
  }

  function drawSlipField(context, label, value, x, y, width, options = {}) {
    context.fillStyle = "#78928b";
    context.font = "700 13px Arial, sans-serif";
    context.fillText(String(label).toUpperCase(), x, y);
    context.fillStyle = "#365952";
    context.font = "700 18px Arial, sans-serif";
    slipWrappedText(context, value, x, y + 30, width, 23, options.maxLines || 2);
  }

  function drawSlipPhoto(context, image, x, y, width, height, radius = 14) {
    if (!image) return false;
    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    context.clip();
    const scale = Math.max(width / image.width, height / image.height);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    const cropX = (image.width - cropWidth) / 2;
    const cropY = (image.height - cropHeight) / 2;
    context.drawImage(image, cropX, cropY, cropWidth, cropHeight, x, y, width, height);
    context.restore();
    return true;
  }

  async function drawAppointmentSlipPage(record, paper) {
    const width = 1240;
    const height = 1754;
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create the image canvas.");
    context.scale(2, 2);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#0b9c8a";
    context.fillRect(0, 0, width, 16);

    const logoElement = paper.querySelector(".patient-slip-hospital-logo");
    const patientElement = paper.querySelector(".patient-slip-patient-photo");
    let doctorElement = paper.querySelector(".patient-slip-doctor-photo");
    if (!doctorElement && record.doctor) {
      doctorElement = new Image();
      doctorElement.src = hospitalAssetUrl(`${record.doctor}.jpg`);
    }
    const [logoData, patientData, doctorData] = await Promise.all([
      getSlipImageDataUrl(logoElement),
      getSlipImageDataUrl(patientElement, patientProfile?.avatar_path || ""),
      getDoctorSlipPhotoDataUrl(record.doctor, doctorElement)
    ]);
    const [logo, patientPhoto, doctorPhoto] = await Promise.all([
      loadSlipImage(logoData), loadSlipImage(patientData), loadSlipImage(doctorData)
    ]);

    if (logo) drawSlipPhoto(context, logo, 76, 56, 100, 100, 12);
    context.fillStyle = "#153f3d";
    context.font = "800 28px Arial, sans-serif";
    context.fillText("RSR ADVANCED CARE HOSPITAL", 202, 91);
    context.fillStyle = "#536f69";
    context.font = "16px Arial, sans-serif";
    context.fillText("Sector V, Salt Lake, Kolkata, West Bengal, India", 202, 122);
    context.fillText("+91 1000000000  ·  rsradvancedcare@gmail.com", 202, 151);
    slipRoundRect(context, 964, 64, 202, 72, 12, "#eaf5f1");
    context.fillStyle = "#176d66";
    context.font = "800 17px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText("APPOINTMENT SLIP", 1065, 108);
    context.textAlign = "left";
    context.strokeStyle = "#dfe9e5";
    context.beginPath(); context.moveTo(76, 185); context.lineTo(1164, 185); context.stroke();

    context.fillStyle = "#52867c";
    context.font = "700 15px Arial, sans-serif";
    context.fillText("PATIENT BOOKING DOCUMENT", 80, 222);
    const status = record.request_status || "Request received";
    const confirmed = /confirm/i.test(status);
    slipRoundRect(context, 886, 199, 278, 42, 21, confirmed ? "#e8f5ed" : "#fff3df");
    context.fillStyle = confirmed ? "#237456" : "#95641d";
    context.font = "700 14px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(status.toUpperCase(), 1025, 226);
    context.textAlign = "left";

    slipRoundRect(context, 76, 258, 1088, 100, 14, "#f0f8f5", "#dcece6");
    context.fillStyle = "#6f8982"; context.font = "700 13px Arial, sans-serif";
    context.fillText("APPLICATION ID", 102, 292);
    context.fillStyle = "#153f3d"; context.font = "800 25px Arial, sans-serif";
    context.fillText(appointmentCode(record), 102, 330);
    context.fillStyle = "#607772"; context.font = "14px Arial, sans-serif";
    context.textAlign = "right"; context.fillText("Keep this ID for tracking", 1138, 320); context.textAlign = "left";

    context.fillStyle = "#153f3d"; context.font = "800 18px Arial, sans-serif";
    context.fillText("PATIENT DETAILS", 80, 408);
    slipRoundRect(context, 76, 428, 1088, 330, 16, "#ffffff", "#e1ebe7");
    slipRoundRect(context, 100, 455, 172, 226, 12, "#edf4f1", "#dce9e3");
    if (patientPhoto) drawSlipPhoto(context, patientPhoto, 100, 455, 172, 226, 12);
    else {
      context.fillStyle = "#718983"; context.font = "14px Arial, sans-serif"; context.textAlign = "center";
      context.fillText("No profile photo", 186, 574); context.textAlign = "left";
    }
    drawSlipField(context, "Full name", patientProfile?.full_name || record.patient_name, 310, 484, 240);
    drawSlipField(context, "Phone", record.phone || patientProfile?.phone, 590, 484, 220);
    drawSlipField(context, "Email", record.email || currentUser?.email, 840, 484, 290, { maxLines: 2 });
    drawSlipField(context, "Date of birth", patientProfile?.date_of_birth ? formatDate(patientProfile.date_of_birth) : "Not provided", 310, 580, 240);
    drawSlipField(context, "Gender", patientProfile?.gender, 590, 580, 220);
    drawSlipField(context, "Blood group", patientProfile?.blood_group, 840, 580, 240);
    if (patientProfile?.address) drawSlipField(context, "Address", patientProfile.address, 310, 674, 790, { maxLines: 2 });

    context.fillStyle = "#153f3d"; context.font = "800 18px Arial, sans-serif";
    context.fillText("DOCTOR DETAILS", 80, 808);
    slipRoundRect(context, 76, 828, 1088, 164, 16, "#ffffff", "#e1ebe7");
    if (doctorPhoto) drawSlipPhoto(context, doctorPhoto, 102, 856, 108, 108, 54);
    else {
      context.beginPath(); context.arc(156, 910, 52, 0, Math.PI * 2); context.fillStyle = "#e4f3ef"; context.fill();
      context.fillStyle = "#16827a"; context.font = "800 22px Arial, sans-serif"; context.textAlign = "center";
      context.fillText(String(record.doctor || "DR").split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase(), 156, 918); context.textAlign = "left";
    }
    context.fillStyle = "#78928b"; context.font = "700 13px Arial, sans-serif"; context.fillText("DOCTOR", 246, 884);
    context.fillStyle = "#183f3e"; context.font = "700 23px Arial, sans-serif"; context.fillText(record.doctor || "Doctor not selected", 246, 919);
    context.fillStyle = "#55716b"; context.font = "17px Arial, sans-serif"; context.fillText(record.department || "Department not selected", 246, 952);

    context.fillStyle = "#153f3d"; context.font = "800 18px Arial, sans-serif";
    context.fillText("APPOINTMENT DETAILS", 80, 1043);
    slipRoundRect(context, 76, 1063, 1088, 250, 16, "#ffffff", "#e1ebe7");
    drawSlipField(context, "Visit date", formatDate(record.preferred_date), 104, 1112, 300);
    drawSlipField(context, "Time", record.preferred_time, 472, 1112, 250);
    drawSlipField(context, "Visit type", record.visit_type, 812, 1112, 300);
    drawSlipField(context, "Booked on", formatDateTime(record.created_at), 104, 1203, 520);
    if (record.reason) drawSlipField(context, "Reason for visit", record.reason, 650, 1203, 470, { maxLines: 3 });

    slipRoundRect(context, 76, 1350, 1088, 108, 14, "#f6f9f8");
    context.fillStyle = "#153f3d"; context.font = "700 16px Arial, sans-serif";
    context.fillText("Please bring this slip and arrive 15 minutes early.", 102, 1390);
    context.fillStyle = "#607772"; context.font = "14px Arial, sans-serif";
    slipWrappedText(context, "The hospital will contact you to confirm your request. For help, call +91 1000000000.", 102, 1421, 1000, 20, 2);
    context.strokeStyle = "#dce9e5"; context.beginPath(); context.moveTo(76, 1502); context.lineTo(1164, 1502); context.stroke();
    context.fillStyle = "#52867c"; context.font = "700 13px Arial, sans-serif";
    context.fillText("RSR ADVANCED CARE HOSPITAL", 80, 1534);
    context.fillStyle = "#758b85"; context.font = "13px Arial, sans-serif"; context.textAlign = "right";
    context.fillText("APPLICATION SLIP · KEEP FOR YOUR VISIT", 1160, 1534); context.textAlign = "left";
    return canvas;
  }

  async function downloadAppointmentSlipJpg(button, paper) {
    if (!trackedSlipRecord || !paper) return;
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Preparing JPG…";
    setStatus(slipStatus, "Preparing your one-page JPG…", "info");
    try {
      const filename = `Appointment-Slip-${appointmentCode(trackedSlipRecord)}-${Date.now()}.jpg`;
      const pageCanvas = await drawAppointmentSlipPage(trackedSlipRecord, paper);
      const jpgDataUrl = pageCanvas.toDataURL("image/jpeg", 0.96);
      const jpegPrefix = "data:image/jpeg;base64,";
      if (!jpgDataUrl.startsWith(jpegPrefix)) throw new Error("The browser did not encode the image as JPEG.");
      const binaryJpeg = atob(jpgDataUrl.slice(jpegPrefix.length));
      const jpegBytes = new Uint8Array(binaryJpeg.length);
      for (let index = 0; index < binaryJpeg.length; index += 1) jpegBytes[index] = binaryJpeg.charCodeAt(index);
      if (jpegBytes.length < 1000 || jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8 || jpegBytes[2] !== 0xff) {
        throw new Error("The generated JPG file is incomplete.");
      }
      const jpgBlob = new Blob([jpegBytes], { type: "image/jpeg" });
      const downloadUrl = URL.createObjectURL(jpgBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
      setStatus(slipStatus, `Saved ${filename}. Open this newly downloaded file.`, "success");
    } catch (error) {
      console.error("Could not download appointment slip JPG:", error);
      setStatus(slipStatus, "The JPG could not be created. Please try again or use Print slip.", "error");
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }
  function setProfileEditMode(editing) {
    if (!profileForm) return;
    profileForm.closest(".patient-profile-section")?.classList.toggle("is-editing", editing);
    profileForm.querySelectorAll("input:not([type=file]), select, textarea").forEach((field) => {
      if (field.id !== "patient-profile-email") field.disabled = !editing;
    });
    if (profilePhotoInput) profilePhotoInput.disabled = !editing;
    if (profileUploadLabel) profileUploadLabel.hidden = !editing;
    if (profileActions) profileActions.hidden = !editing;
    if (profileEditButton) profileEditButton.hidden = editing;
  }

  async function showProfilePhoto(path) {
    if (!profileAvatar || !client || !path) {
      if (profileAvatar) profileAvatar.hidden = true;
      if (profileAvatarPlaceholder) profileAvatarPlaceholder.hidden = false;
      return;
    }
    const { data, error } = await client.storage.from("patient-avatars").createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      profileAvatar.hidden = true;
      if (profileAvatarPlaceholder) profileAvatarPlaceholder.hidden = false;
      return;
    }
    profileAvatar.src = data.signedUrl;
    profileAvatar.hidden = false;
    if (profileAvatarPlaceholder) profileAvatarPlaceholder.hidden = true;
  }

  async function displayPatientProfile(profile) {
    const source = profile || {};
    const fullName = source.full_name || getUserName(currentUser);
    const fullNameInput = document.querySelector("#patient-profile-full-name");
    const emailInput = document.querySelector("#patient-profile-email");
    if (fullNameInput) fullNameInput.value = fullName === "Patient" ? "" : fullName;
    if (emailInput) emailInput.value = currentUser?.email || "";
    const fields = [
      ["patient-profile-phone", source.phone],
      ["patient-profile-date-of-birth", source.date_of_birth],
      ["patient-profile-gender", source.gender],
      ["patient-profile-blood-group", source.blood_group],
      ["patient-profile-address", source.address]
    ];
    fields.forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field) field.value = value || "";
    });
    if (accountName) accountName.textContent = `Hello, ${fullName}`;
    await showProfilePhoto(source.avatar_path);
  }

  async function loadPatientProfile() {
    if (!currentUser || !client) return;
    const { data, error } = await client.from("patient_profiles")
      .select("user_id,full_name,phone,date_of_birth,gender,blood_group,address,avatar_path,updated_at")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (error) {
      console.error("Could not load patient profile:", error);
      if (profileForm) setStatus(profileStatus, "Profile details could not load. Run the dashboard setup SQL in Supabase.", "error");
      return;
    }
    patientProfile = data || null;
    fillAppointmentPhone(patientProfile?.phone || "");
    await displayPatientProfile(patientProfile);
    setProfileEditMode(false);
  }

  profileEditButton?.addEventListener("click", () => {
    setStatus(profileStatus, "");
    setProfileEditMode(true);
  });

  profileCancelButton?.addEventListener("click", async () => {
    selectedProfilePhoto = null;
    if (profilePhotoInput) profilePhotoInput.value = "";
    await displayPatientProfile(patientProfile);
    setProfileEditMode(false);
    setStatus(profileStatus, "");
  });

  profilePhotoInput?.addEventListener("change", () => {
    const file = profilePhotoInput.files?.[0];
    if (!file) return;
    if (!/^(image\/jpeg|image\/png|image\/webp)$/.test(file.type) || file.size > 3 * 1024 * 1024) {
      profilePhotoInput.value = "";
      selectedProfilePhoto = null;
      setStatus(profileStatus, "Choose a JPG, PNG, or WebP photo under 3 MB.", "error");
      return;
    }
    selectedProfilePhoto = file;
    if (profileAvatar) {
      profileAvatar.src = URL.createObjectURL(file);
      profileAvatar.hidden = false;
    }
    if (profileAvatarPlaceholder) profileAvatarPlaceholder.hidden = true;
    setStatus(profileStatus, "Photo selected. Save profile to upload it.", "info");
  });

  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentUser || !client) return;
    const saveButton = profileForm.querySelector('[type="submit"]');
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.classList.add("is-saving");
      saveButton.setAttribute("aria-busy", "true");
    }
    setStatus(profileStatus, "Saving profile…", "loading");
    try {
      let avatarPath = patientProfile?.avatar_path || null;
      if (selectedProfilePhoto) {
        const extension = selectedProfilePhoto.type === "image/png" ? "png" : selectedProfilePhoto.type === "image/webp" ? "webp" : "jpg";
        const randomPart = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        avatarPath = `${currentUser.id}/${randomPart}.${extension}`;
        const { error: uploadError } = await client.storage.from("patient-avatars")
          .upload(avatarPath, selectedProfilePhoto, { contentType: selectedProfilePhoto.type, upsert: false });
        if (uploadError) throw uploadError;
      }

      const row = {
        user_id: currentUser.id,
        full_name: document.querySelector("#patient-profile-full-name").value.trim(),
        phone: document.querySelector("#patient-profile-phone").value.trim() || null,
        date_of_birth: document.querySelector("#patient-profile-date-of-birth").value || null,
        gender: document.querySelector("#patient-profile-gender").value || null,
        blood_group: document.querySelector("#patient-profile-blood-group").value || null,
        address: document.querySelector("#patient-profile-address").value.trim() || null,
        avatar_path: avatarPath,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await client.from("patient_profiles").upsert(row, { onConflict: "user_id" })
        .select("user_id,full_name,phone,date_of_birth,gender,blood_group,address,avatar_path,updated_at")
        .single();
      if (error) throw error;
      patientProfile = data;
      fillAppointmentPhone(patientProfile.phone || "");
      selectedProfilePhoto = null;
      if (profilePhotoInput) profilePhotoInput.value = "";
      const { data: updatedAuth, error: metadataError } = await client.auth.updateUser({ data: { full_name: data.full_name } });
      if (!metadataError && updatedAuth?.user) {
        currentUser = updatedAuth.user;
        window.hospitalAuth.currentUser = currentUser;
      }
      await displayPatientProfile(patientProfile);
      setProfileEditMode(false);
      if (trackedSlipRecord) await renderAppointmentSlip(trackedSlipRecord);
      setStatus(profileStatus, "Your profile has been updated.", "success");
    } catch (error) {
      console.error("Could not save patient profile:", error);
      setStatus(profileStatus, error?.message || "Could not save your profile. Check the dashboard setup SQL and photo storage policies.", "error");
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.classList.remove("is-saving");
        saveButton.removeAttribute("aria-busy");
      }
    }
  });
  function updateAccountUI(user) {
    currentUser = user || null;
    window.hospitalAuth.currentUser = currentUser;
    if (appointmentEmail) {
      appointmentEmail.readOnly = Boolean(currentUser);
      appointmentEmail.value = currentUser?.email || "";
    }
    if (currentUser && appointmentName && !appointmentName.value) {
      appointmentName.value = getUserName(currentUser);
    }

    if (accountName && currentUser) accountName.textContent = `Hello, ${getUserName(currentUser)}`;

    if (!currentUser) {
      appointments = [];
      appointmentReminders = [];
      patientNotifications = [];
      patientProfile = null;
      patientProfilePromise = Promise.resolve();
      trackedSlipRecord = null;
      if (slipPreview) {
        slipPreview.replaceChildren();
        slipPreview.hidden = true;
      }
      if (slipApplicationId) slipApplicationId.value = "";
      setStatus(slipStatus, "");
      followedDoctors = [];
      loadingFollowedDoctors = false;
      renderFollowedDoctors();
      loadingAppointments = false;
      renderRecords();
      if (accountAuthPanel) accountAuthPanel.hidden = false;
      if (accountContent) accountContent.hidden = true;
      if (authForms) authForms.hidden = false;
      return;
    }

    if (accountAuthPanel) accountAuthPanel.hidden = true;
    if (authForms) authForms.hidden = true;
    if (confirmationPanel) confirmationPanel.hidden = true;
    if (accountContent) accountContent.hidden = false;
    loadAppointments();
    loadPatientNotifications();
    patientProfilePromise = loadPatientProfile();
    loadFollowedDoctors();
    if (!countdownTimer) countdownTimer = window.setInterval(() => {
      updateAppointmentCountdowns();
      syncAppointmentReminders();
      renderRecords();
    }, 60000);
  }

  async function saveAppointment(data) {
    if (!currentUser || !client) throw new Error("Sign in before booking an appointment.");
    const row = {
      user_id: currentUser.id,
      patient_name: data.patientName,
      email: currentUser.email,
      phone: data.phone,
      department: data.department,
      doctor: data.doctor,
      visit_type: data.visitType,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      reason: data.reason || null
    };
    const { data: saved, error } = await client
      .from("appointments")
      .insert(row)
      .select("id,appointment_code,user_id,patient_name,email,phone,department,doctor,visit_type,preferred_date,preferred_time,reason,request_status,notification_read,created_at")
      .single();
    if (error) throw error;

    appointments = [saved, ...appointments.filter((item) => item.id !== saved.id)];
    renderRecords();
    return saved;
  }

  function requireBookingAccess(action = "book", bookingDraft = null) {
    if (!configured || !client) {
      if (setupNote) setupNote.hidden = false;
      openLogin("sign-in");
      return false;
    }
    if (!currentUser) {
      setPendingAction(action);
      if (bookingDraft) saveAppointmentDraft(bookingDraft);
      openLogin("sign-in");
      setStatus(authStatus, "Sign in or create an account to finish booking.", "info");
      return false;
    }
    return true;
  }

  window.hospitalAuth = {
    currentUser: null,
    profilePhone: "",
    get followedDoctors() { return followedDoctors; },
    get isConfigured() { return Boolean(configured && client); },
    requireBookingAccess,
    saveAppointment,
    toggleDoctorFollow,
    unfollowDoctor,
    hasPendingBooking,
    consumePendingBooking,
    takeAppointmentDraft
  };
  // A direct dashboard visit without a session shows sign-in in place. A sign-in link
  // from the website can also open the same form in the modal.
  const params = new URLSearchParams(window.location.search);
  if (!isDashboard && ["1", "confirmed"].includes(params.get("auth"))) {
    const next = params.get("next");
    if (["dashboard", "book", "follow"].includes(next)) setPendingAction(next);
    if (params.get("auth") === "1") openLogin("sign-in");
  }

  document.querySelector("#patient-account-button")?.addEventListener("click", goToDashboard);
  document.querySelector("#about-patient-account-button")?.addEventListener("click", () => {
    document.querySelector("#patient-account-button")?.click();
  });
  function setNotificationPopover(open) {
    if (!notificationPopover || isDashboard) return;
    notificationPopover.hidden = !open;
    notificationButton?.setAttribute("aria-expanded", String(open));
    if (open && currentUser) markNotificationsRead();
  }

  notificationButton?.addEventListener("click", () => {
    if (isDashboard && currentUser) {
      selectAccountTab("notifications");
      return;
    }
    if (isDashboard) {
      openLogin("sign-in");
      return;
    }
    setNotificationPopover(true);
  });

  if (notificationWrap && notificationPopover && !isDashboard) {
    notificationWrap.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") setNotificationPopover(true);
    });
    notificationWrap.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") setNotificationPopover(false);
    });
    document.addEventListener("click", (event) => {
      if (!notificationWrap.contains(event.target)) setNotificationPopover(false);
    });
  }
  document.querySelector("#patient-account-close")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.authMode));
  });
  document.querySelectorAll(".patient-password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.getAttribute("aria-controls"));
      if (!input) return;
      const isVisible = input.type === "password";
      input.type = isVisible ? "text" : "password";
      button.classList.toggle("is-visible", isVisible);
      button.setAttribute("aria-pressed", String(isVisible));
      button.setAttribute("aria-label", `${isVisible ? "Hide" : "Show"} password`);
      const label = button.querySelector("span");
      if (label) label.textContent = isVisible ? "Hide" : "Show";
    });
  });
  appointmentsTab?.addEventListener("click", () => selectAccountTab("appointments"));
  slipTab?.addEventListener("click", () => selectAccountTab("slip"));
  followingTab?.addEventListener("click", () => selectAccountTab("following"));
  notificationsTab?.addEventListener("click", () => selectAccountTab("notifications"));

  const swipeableAccountViews = [appointmentsView, slipView, notificationsView, followingView].filter(Boolean);
  const orderedAccountTabs = [appointmentsTab, slipTab, notificationsTab, followingTab].filter(Boolean);
  let accountSwipeStart = null;
  swipeableAccountViews.forEach((panel) => {
    panel.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1 || event.target.closest("button, a, input, textarea, select, [role='button']")) {
        accountSwipeStart = null;
        return;
      }
      accountSwipeStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    panel.addEventListener("touchend", (event) => {
      if (!accountSwipeStart || event.changedTouches.length !== 1) return;
      const deltaX = event.changedTouches[0].clientX - accountSwipeStart.x;
      const deltaY = event.changedTouches[0].clientY - accountSwipeStart.y;
      accountSwipeStart = null;
      if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
      const activeIndex = orderedAccountTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
      const nextIndex = deltaX < 0 ? activeIndex + 1 : activeIndex - 1;
      if (activeIndex >= 0 && nextIndex >= 0 && nextIndex < orderedAccountTabs.length) {
        const nextTab = orderedAccountTabs[nextIndex];
        nextTab.click();
        nextTab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      }
    }, { passive: true });
    panel.addEventListener("touchcancel", () => { accountSwipeStart = null; }, { passive: true });
  });

  document.querySelector("#patient-sign-out")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    try {
      await client?.auth.signOut();
      if (isDashboard) window.location.replace("./index.html");
    } catch (error) {
      console.error("Could not sign out:", error);
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    }
  });

  signInForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!configured || !client) {
      setStatus(authStatus, "Add the Supabase project URL and publishable key to supabase-config.js first.", "error");
      return;
    }
    const submit = signInForm.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.classList.add("is-loading");
    submit.setAttribute("aria-busy", "true");
    setStatus(authStatus, "Signing in…", "loading");
    const email = document.querySelector("#patient-sign-in-email").value.trim();
    const password = document.querySelector("#patient-sign-in-password").value;
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) setStatus(authStatus, friendlyError(error), "error");
    } catch (error) {
      setStatus(authStatus, friendlyError(error), "error");
    } finally {
      submit.disabled = false;
      submit.classList.remove("is-loading");
      submit.removeAttribute("aria-busy");
    }
  });

  signUpForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!configured || !client) {
      setStatus(authStatus, "Add the Supabase project URL and publishable key to supabase-config.js first.", "error");
      return;
    }
    const submit = signUpForm.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.classList.add("is-loading");
    submit.setAttribute("aria-busy", "true");
    setStatus(authStatus, "Creating your account…", "loading");
    const fullName = document.querySelector("#patient-sign-up-name").value.trim();
    const email = document.querySelector("#patient-sign-up-email").value.trim();
    const password = document.querySelector("#patient-sign-up-password").value;
    latestSignupEmail = email;
    try { localStorage.setItem(createdAccountToastKey, "1"); } catch (error) { /* Fall back to the session toast marker. */ }
    try { sessionStorage.setItem(welcomeToastKey, "created"); } catch (error) { /* The confirmation return URL still identifies a newly created account. */ }
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: indexUrl("confirmed")
        }
      });
      if (error) {
        try { sessionStorage.removeItem(welcomeToastKey); } catch (storageError) { /* Ignore unavailable session storage. */ }
        try { localStorage.removeItem(createdAccountToastKey); } catch (storageError) { /* Ignore unavailable local storage. */ }
        setStatus(authStatus, friendlyError(error), "error");
        return;
      }
      const signedUpUser = data.user || data.session?.user;
      if (welcomeToastKindShownForSession !== "created") {
        showWelcomeToast(fullName || getUserName(signedUpUser), "created");
      }
      if (data.session) {
        try { sessionStorage.removeItem(welcomeToastKey); } catch (storageError) { /* Ignore unavailable session storage. */ }
        if (isDashboard || getPendingAction() !== "dashboard") {
          try { localStorage.removeItem(createdAccountToastKey); } catch (storageError) { /* Ignore unavailable local storage. */ }
        }
        welcomeToastShownForSession = true;
        const sessionId = signedUpUser?.id ? signedUpUser.id + ":" + (signedUpUser.last_sign_in_at || "current-session") : getWelcomeSessionId();
        try { if (sessionId) sessionStorage.setItem(welcomeToastSeenKey, sessionId); } catch (storageError) { /* Keep the one-time guard in memory. */ }
        setStatus(authStatus, "Account created successfully.", "success");
      } else {
        if (confirmationEmail) confirmationEmail.textContent = email;
        if (authForms) authForms.hidden = true;
        if (confirmationPanel) confirmationPanel.hidden = false;
        setStatus(authStatus, "");
      }
    } catch (error) {
      setStatus(authStatus, friendlyError(error), "error");
    } finally {
      submit.disabled = false;
      submit.classList.remove("is-loading");
      submit.removeAttribute("aria-busy");
    }
  });

  document.querySelector("#patient-resend-confirmation")?.addEventListener("click", async (event) => {
    const email = latestSignupEmail || document.querySelector("#patient-sign-up-email")?.value.trim();
    if (!email || !client) return;
    const button = event.currentTarget;
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    setStatus(confirmationStatus, "Sending confirmation email…", "loading");
    try {
      const { error } = await client.auth.resend({ type: "signup", email });
      setStatus(confirmationStatus, error ? friendlyError(error) : "A new confirmation email has been sent.", error ? "error" : "success");
    } catch (error) {
      setStatus(confirmationStatus, friendlyError(error), "error");
    } finally {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    }
  });

  document.querySelector("#patient-password-reset")?.addEventListener("click", async () => {
    if (!configured || !client) {
      setStatus(authStatus, "Add the Supabase project URL and publishable key to supabase-config.js first.", "error");
      return;
    }
    const email = document.querySelector("#patient-sign-in-email")?.value.trim();
    if (!email) {
      setStatus(authStatus, "Enter your email address, then choose Forgot password?", "info");
      return;
    }
    latestRecoveryEmail = email;
    const button = document.querySelector("#patient-password-reset");
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    setStatus(authStatus, "Sending password reset email…", "loading");
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: indexUrl("recovery")
      });
      if (error) {
        setStatus(authStatus, friendlyError(error), "error");
      } else {
        setRecoveryVerifiedUI(false);
        try { localStorage.removeItem(recoveryVerifiedKey); } catch (storageError) { /* Ignore unavailable local storage. */ }
        if (recoveryEmail) recoveryEmail.textContent = email;
        if (authForms) authForms.hidden = true;
        if (recoveryPanel) recoveryPanel.hidden = false;
        setStatus(recoveryStatus, "If an account uses that email, a password reset link will arrive shortly. Open the link on this device to continue.", "success");
        if (accountTitle) accountTitle.textContent = "Check your email";
      }
    } catch (error) {
      setStatus(authStatus, friendlyError(error), "error");
    } finally {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    }
  });

  document.querySelector("#patient-resend-recovery")?.addEventListener("click", async (event) => {
    const email = latestRecoveryEmail || recoveryEmail?.textContent.trim();
    if (!email || !client) return;
    const button = event.currentTarget;
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    setStatus(recoveryStatus, "Sending a new password reset link…", "loading");
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: indexUrl("recovery")
      });
      setStatus(recoveryStatus, error ? friendlyError(error) : "If an account uses that email, a new reset link has been sent.", error ? "error" : "success");
    } catch (error) {
      setStatus(recoveryStatus, friendlyError(error), "error");
    } finally {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    }
  });

  recoveryCreatePasswordButton?.addEventListener("click", async () => {
    let isVerified = recoveryIsVerified;
    if (!isVerified && configured && client) {
      const marker = getFreshRecoveryMarker();
      try {
        const { data, error } = await client.auth.getUser();
        isVerified = !error && Boolean(data.user && marker?.userId === data.user.id);
      } catch (error) { isVerified = false; }
    }
    if (!isVerified) {
      setStatus(recoveryStatus, "Open the password reset link in this browser first, then choose Create new password.", "error");
      return;
    }
    setRecoveryVerifiedUI(true);
    setMode("new-password");
  });

  document.querySelector("#patient-recovery-back")?.addEventListener("click", () => {
    if (recoveryPanel) recoveryPanel.hidden = true;
    if (authForms) authForms.hidden = false;
    setMode("sign-in");
  });

  newPasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.querySelector("#patient-new-password").value;
    const confirmation = document.querySelector("#patient-confirm-password").value;
    if (password !== confirmation) {
      setStatus(authStatus, "The two passwords do not match.", "error");
      return;
    }
    const button = newPasswordForm.querySelector('[type="submit"]');
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    setStatus(authStatus, "Saving your new password…", "loading");
    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) {
        setStatus(authStatus, friendlyError(error), "error");
        return;
      }
      try { localStorage.removeItem(recoveryVerifiedKey); } catch (storageError) { /* Ignore unavailable local storage. */ }
      setRecoveryVerifiedUI(false);
      setMode("sign-in");
      if (dialog?.open) dialog.close();
      setStatus(authStatus, "");
      showWelcomeToast("", "password-changed");
    } catch (error) {
      setStatus(authStatus, friendlyError(error), "error");
    } finally {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    }
  });

  document.querySelector("#patient-confirmation-back")?.addEventListener("click", () => setMode("sign-in"));

  if (!configured) {
    if (setupNote) setupNote.hidden = false;
  } else {
    client = window.supabase.createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    client.auth.onAuthStateChange((eventName, session) => {
      if (eventName === "SIGNED_OUT") {
        welcomeToastShownForSession = false;
        try { localStorage.removeItem(recoveryVerifiedKey); } catch (error) { /* Ignore unavailable local storage. */ }
      }
      currentUser = session?.user || null;
      updateAccountUI(currentUser);
      if (eventName === "SIGNED_IN" || eventName === "INITIAL_SESSION" || eventName === "PASSWORD_RECOVERY") {
        queueMicrotask(() => handleSignedInAction(eventName));
      }
    });
    window.addEventListener("storage", async (event) => {
      if (event.key !== recoveryVerifiedKey || !event.newValue) return;
      const marker = getFreshRecoveryMarker();
      if (!marker) return;
      try {
        const { data, error } = await client.auth.getUser();
        if (!error && data.user?.id === marker.userId) {
          setRecoveryVerifiedUI(true);
          if (recoveryPanel) recoveryPanel.hidden = false;
          if (authForms) authForms.hidden = true;
          if (accountTitle) accountTitle.textContent = "Email verified";
          setStatus(recoveryStatus, "Your reset link is verified. You can now create a new password.", "success");
        }
      } catch (error) { /* The verified tab can still use its own session. */ }
    });

    const initialRecoveryUrl = new URL(window.location.href);
    const initialRecoveryHash = new URLSearchParams(initialRecoveryUrl.hash.replace(/^#/, ""));
    const arrivedFromRecovery = initialRecoveryUrl.searchParams.get("auth") === "recovery" || initialRecoveryHash.get("type") === "recovery";
    if (arrivedFromRecovery) {
      client.auth.getSession().then(({ data, error }) => {
        if (!error && data.session?.user) {
          currentUser = data.session.user;
          updateAccountUI(currentUser);
          handleSignedInAction("PASSWORD_RECOVERY");
        } else {
          openLogin("recovery-email");
          setStatus(recoveryStatus, "This reset link could not be verified. Request a new reset link and open the newest email.", "error");
        }
      });
    }
  }
})();
