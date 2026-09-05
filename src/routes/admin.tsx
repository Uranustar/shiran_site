import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

// =========================
// TYPES
// =========================

type SiteContentRow = {
  id: string;
  section: string;
  content: Record<string, unknown>;
  updated_at: string;
};

type ContactMessage = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  topic: string | null;
  message: string;
  created_at: string;
};

type Donation = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  amount: number;
  monthly: boolean;
  dedication: string | null;
  created_at: string;
};

type VolunteerApplication = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  message: string | null;
  created_at: string;
};

type AdminSection =
  | "content"
  | "messages"
  | "donations"
  | "volunteers";

type EditType =
  | "message"
  | "donation"
  | "volunteer"
  | null;

// =========================
// MAIN
// =========================

function AdminPage() {
  const [sections, setSections] = useState<SiteContentRow[]>([]);
  const [selectedSection, setSelectedSection] = useState("");

  const [editorValue, setEditorValue] = useState("");

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);

  const [activeSection, setActiveSection] =
    useState<AdminSection>("content");

  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // CRUD STATES
  // =========================

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);

  const [editingType, setEditingType] =
    useState<EditType>(null);

  const [editingMessage, setEditingMessage] =
    useState<ContactMessage | null>(null);

  const [editingDonation, setEditingDonation] =
    useState<Donation | null>(null);

  const [editingVolunteer, setEditingVolunteer] =
    useState<VolunteerApplication | null>(null);

  const [newContentSection, setNewContentSection] =
    useState("");

  const [newContentValue, setNewContentValue] =
    useState("{}");

  // =========================
  // CHECK ADMIN
  // =========================

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setCheckingAuth(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        setCheckingAuth(false);
        setLoading(false);
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (adminError) {
        console.error("Admin check failed:", adminError);

        setIsAdmin(false);
        setError("לא ניתן לבדוק הרשאות מנהל.");
        setCheckingAuth(false);
        setLoading(false);
        return;
      }

      if (!admin) {
        await supabase.auth.signOut();

        setIsAdmin(false);
        setError("אין לך הרשאה להיכנס לאזור המנהל.");
        setCheckingAuth(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      await loadAllData();
    } catch (err) {
      console.error(err);

      setIsAdmin(false);
      setError("אירעה שגיאה בבדיקת ההרשאה.");
    } finally {
      setCheckingAuth(false);
      setLoading(false);
    }
  }

  // =========================
  // LOAD ALL DATA
  // =========================

  async function loadAllData() {
    setError("");
    setMessage("");

    await Promise.all([
      loadContent(),
      loadMessages(),
      loadDonations(),
      loadVolunteers(),
    ]);
  }

  // =========================
  // SITE CONTENT - READ
  // =========================

  async function loadContent() {
    const { data, error } = await supabase
      .from("site_content")
      .select("id, section, content, updated_at")
      .order("section");

    if (error) {
      console.error(
        "Failed to load site content:",
        error,
      );

      setError(
        `שגיאה בטעינת תוכן האתר: ${error.message}`,
      );

      return;
    }

    const rows = (data ?? []) as SiteContentRow[];

    setSections(rows);

    if (rows.length > 0) {
      setSelectedSection(rows[0].section);
      setEditorValue(
        JSON.stringify(rows[0].content, null, 2),
      );
    } else {
      setSelectedSection("");
      setEditorValue("");
    }
  }

  // =========================
  // CONTACT MESSAGES - READ
  // =========================

  async function loadMessages() {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to load messages:",
        error,
      );

      setError(
        `שגיאה בטעינת הפניות: ${error.message}`,
      );

      return;
    }

    setMessages(
      (data ?? []) as ContactMessage[],
    );
  }

  // =========================
  // DONATIONS - READ
  // =========================

  async function loadDonations() {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to load donations:",
        error,
      );

      setError(
        `שגיאה בטעינת התרומות: ${error.message}`,
      );

      return;
    }

    setDonations(
      (data ?? []) as Donation[],
    );
  }

  // =========================
  // VOLUNTEERS - READ
  // =========================

  async function loadVolunteers() {
    const { data, error } = await supabase
      .from("volunteer_applications")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to load volunteers:",
        error,
      );

      setError(
        `שגיאה בטעינת פניות ההתנדבות: ${error.message}`,
      );

      return;
    }

    setVolunteers(
      (data ?? []) as VolunteerApplication[],
    );
  }

  // =========================
  // LOGIN
  // =========================

  async function login(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const {
      data,
      error: loginError,
    } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !data.user) {
      console.error(
        "Login failed:",
        loginError,
      );

      setError(
        "האימייל או הסיסמה אינם נכונים.",
      );

      setLoading(false);
      return;
    }

    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();

      setIsAdmin(false);
      setError(
        "המשתמש הזה אינו מנהל.",
      );

      setLoading(false);
      return;
    }

    setIsAdmin(true);

    setEmail("");
    setPassword("");

    await loadAllData();

    setLoading(false);
  }

  // =========================
  // LOGOUT
  // =========================

  async function logout() {
    await supabase.auth.signOut();

    setIsAdmin(false);
    setSections([]);
    setMessages([]);
    setDonations([]);
    setVolunteers([]);

    setSelectedSection("");
    setEditorValue("");

    setMessage("");
    setError("");
  }

  // =========================
  // SELECT CONTENT SECTION
  // =========================

  function selectSection(
    section: SiteContentRow,
  ) {
    setSelectedSection(section.section);

    setEditorValue(
      JSON.stringify(
        section.content,
        null,
        2,
      ),
    );

    setMessage("");
    setError("");
  }

  // =========================
  // SITE CONTENT - UPDATE
  // =========================

  async function saveContent() {
    if (!selectedSection) return;

    let parsedContent: Record<
      string,
      unknown
    >;

    try {
      parsedContent =
        JSON.parse(editorValue);

      if (
        typeof parsedContent !==
          "object" ||
        parsedContent === null ||
        Array.isArray(parsedContent)
      ) {
        setMessage(
          "❌ התוכן חייב להיות אובייקט JSON תקין.",
        );

        return;
      }
    } catch {
      setMessage(
        "❌ התוכן אינו JSON תקין. בדקי את הסוגריים, המרכאות והפסיקים.",
      );

      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const {
      error: saveError,
    } = await supabase
      .from("site_content")
      .update({
        content: parsedContent,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "section",
        selectedSection,
      );

    if (saveError) {
      console.error(
        "Failed to save site content:",
        saveError,
      );

      setError(
        `❌ השמירה נכשלה: ${saveError.message}`,
      );

      setSaving(false);
      return;
    }

    setSections((current) =>
      current.map((item) =>
        item.section ===
        selectedSection
          ? {
              ...item,
              content:
                parsedContent,
              updated_at:
                new Date().toISOString(),
            }
          : item,
      ),
    );

    setMessage(
      "✅ נשמר בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // SITE CONTENT - CREATE
  // =========================

  async function createContent() {
    setError("");
    setMessage("");

    if (!newContentSection.trim()) {
      setError(
        "יש להזין שם לסקשן.",
      );

      return;
    }

    let parsedContent: Record<
      string,
      unknown
    >;

    try {
      parsedContent =
        JSON.parse(
          newContentValue,
        );

      if (
        typeof parsedContent !==
          "object" ||
        parsedContent === null ||
        Array.isArray(parsedContent)
      ) {
        setError(
          "התוכן חייב להיות אובייקט JSON.",
        );

        return;
      }
    } catch {
      setError(
        "התוכן חייב להיות JSON תקין.",
      );

      return;
    }

    setSaving(true);

    const {
      error: insertError,
    } = await supabase
      .from("site_content")
      .insert({
        section:
          newContentSection.trim(),
        content: parsedContent,
      });

    if (insertError) {
      console.error(
        insertError,
      );

      setError(
        `❌ יצירת התוכן נכשלה: ${insertError.message}`,
      );

      setSaving(false);
      return;
    }

    setNewContentSection("");
    setNewContentValue("{}");
    setShowContentForm(false);

    await loadContent();

    setMessage(
      "✅ הסקשן נוצר בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // SITE CONTENT - DELETE
  // =========================

  async function deleteContent(
    section: SiteContentRow,
  ) {
    const confirmed =
      window.confirm(
        `האם למחוק את הסקשן "${section.section}"?\n\nהפעולה אינה ניתנת לביטול.`,
      );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const {
      error: deleteError,
    } = await supabase
      .from("site_content")
      .delete()
      .eq(
        "id",
        section.id,
      );

    if (deleteError) {
      console.error(
        deleteError,
      );

      setError(
        `❌ המחיקה נכשלה: ${deleteError.message}`,
      );

      return;
    }

    await loadContent();

    setMessage(
      "✅ הסקשן נמחק בהצלחה.",
    );
  }

  // =========================
  // CONTACT MESSAGE - CREATE
  // =========================

  async function createMessage(
    data: {
      name: string;
      phone: string;
      email: string;
      topic: string;
      message: string;
    },
  ) {
    setSaving(true);
    setError("");

    const {
      error: insertError,
    } = await supabase
      .from("contact_messages")
      .insert({
        name: data.name,
        phone:
          data.phone || null,
        email:
          data.email || null,
        topic:
          data.topic || null,
        message: data.message,
      });

    if (insertError) {
      console.error(
        insertError,
      );

      setError(
        `❌ הוספת הפנייה נכשלה: ${insertError.message}`,
      );

      setSaving(false);
      return;
    }

    setShowMessageForm(false);

    await loadMessages();

    setMessage(
      "✅ הפנייה נוספה בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // CONTACT MESSAGE - UPDATE
  // =========================

  async function updateMessage(
    data: {
      name: string;
      phone: string;
      email: string;
      topic: string;
      message: string;
    },
  ) {
    if (!editingMessage) return;

    setSaving(true);
    setError("");

    const {
      error: updateError,
    } = await supabase
      .from("contact_messages")
      .update({
        name: data.name,
        phone:
          data.phone || null,
        email:
          data.email || null,
        topic:
          data.topic || null,
        message: data.message,
      })
      .eq(
        "id",
        editingMessage.id,
      );

    if (updateError) {
      console.error(
        updateError,
      );

      setError(
        `❌ עדכון הפנייה נכשל: ${updateError.message}`,
      );

      setSaving(false);
      return;
    }

    setEditingMessage(null);
    setEditingType(null);

    await loadMessages();

    setMessage(
      "✅ הפנייה עודכנה בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // CONTACT MESSAGE - DELETE
  // =========================

  async function deleteMessage(
    item: ContactMessage,
  ) {
    const confirmed =
      window.confirm(
        "האם את בטוחה שאת רוצה למחוק את הפנייה?\n\nהפעולה אינה ניתנת לביטול.",
      );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const {
      error: deleteError,
    } = await supabase
      .from("contact_messages")
      .delete()
      .eq(
        "id",
        item.id,
      );

    if (deleteError) {
      console.error(
        deleteError,
      );

      setError(
        `❌ המחיקה נכשלה: ${deleteError.message}`,
      );

      return;
    }

    await loadMessages();

    setMessage(
      "✅ הפנייה נמחקה בהצלחה.",
    );
  }

  // =========================
  // DONATION - CREATE
  // =========================

  async function createDonation(
    data: {
      name: string;
      email: string;
      phone: string;
      amount: string;
      monthly: boolean;
      dedication: string;
    },
  ) {
    setSaving(true);
    setError("");

    const amount =
      Number(data.amount);

    if (
      !data.name.trim() ||
      !data.amount ||
      Number.isNaN(amount)
    ) {
      setError(
        "יש להזין שם וסכום תקין.",
      );

      setSaving(false);
      return;
    }

    const {
      error: insertError,
    } = await supabase
      .from("donations")
      .insert({
        name: data.name,
        email:
          data.email || null,
        phone:
          data.phone || null,
        amount,
        monthly: data.monthly,
        dedication:
          data.dedication || null,
      });

    if (insertError) {
      console.error(
        insertError,
      );

      setError(
        `❌ הוספת התרומה נכשלה: ${insertError.message}`,
      );

      setSaving(false);
      return;
    }

    setShowDonationForm(false);

    await loadDonations();

    setMessage(
      "✅ התרומה נוספה בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // DONATION - UPDATE
  // =========================

  async function updateDonation(
    data: {
      name: string;
      email: string;
      phone: string;
      amount: string;
      monthly: boolean;
      dedication: string;
    },
  ) {
    if (!editingDonation) return;

    setSaving(true);
    setError("");

    const amount =
      Number(data.amount);

    if (
      !data.name.trim() ||
      !data.amount ||
      Number.isNaN(amount)
    ) {
      setError(
        "יש להזין שם וסכום תקין.",
      );

      setSaving(false);
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("donations")
      .update({
        name: data.name,
        email:
          data.email || null,
        phone:
          data.phone || null,
        amount,
        monthly: data.monthly,
        dedication:
          data.dedication || null,
      })
      .eq(
        "id",
        editingDonation.id,
      );

    if (updateError) {
      console.error(
        updateError,
      );

      setError(
        `❌ עדכון התרומה נכשל: ${updateError.message}`,
      );

      setSaving(false);
      return;
    }

    setEditingDonation(null);
    setEditingType(null);

    await loadDonations();

    setMessage(
      "✅ התרומה עודכנה בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // DONATION - DELETE
  // =========================

  async function deleteDonation(
    item: Donation,
  ) {
    const confirmed =
      window.confirm(
        "האם את בטוחה שאת רוצה למחוק את התרומה?\n\nהפעולה אינה ניתנת לביטול.",
      );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const {
      error: deleteError,
    } = await supabase
      .from("donations")
      .delete()
      .eq(
        "id",
        item.id,
      );

    if (deleteError) {
      console.error(
        deleteError,
      );

      setError(
        `❌ המחיקה נכשלה: ${deleteError.message}`,
      );

      return;
    }

    await loadDonations();

    setMessage(
      "✅ התרומה נמחקה בהצלחה.",
    );
  }

  // =========================
  // VOLUNTEER - CREATE
  // =========================

  async function createVolunteer(
    data: {
      name: string;
      email: string;
      phone: string;
      role: string;
      message: string;
    },
  ) {
    setSaving(true);
    setError("");

    if (!data.name.trim()) {
      setError(
        "יש להזין שם.",
      );

      setSaving(false);
      return;
    }

    const {
      error: insertError,
    } = await supabase
      .from(
        "volunteer_applications",
      )
      .insert({
        name: data.name,
        email:
          data.email || null,
        phone:
          data.phone || null,
        role:
          data.role || null,
        message:
          data.message || null,
      });

    if (insertError) {
      console.error(
        insertError,
      );

      setError(
        `❌ הוספת הפנייה נכשלה: ${insertError.message}`,
      );

      setSaving(false);
      return;
    }

    setShowVolunteerForm(false);

    await loadVolunteers();

    setMessage(
      "✅ פנייה ההתנדבות נוספה בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // VOLUNTEER - UPDATE
  // =========================

  async function updateVolunteer(
    data: {
      name: string;
      email: string;
      phone: string;
      role: string;
      message: string;
    },
  ) {
    if (!editingVolunteer) return;

    setSaving(true);
    setError("");

    if (!data.name.trim()) {
      setError(
        "יש להזין שם.",
      );

      setSaving(false);
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from(
        "volunteer_applications",
      )
      .update({
        name: data.name,
        email:
          data.email || null,
        phone:
          data.phone || null,
        role:
          data.role || null,
        message:
          data.message || null,
      })
      .eq(
        "id",
        editingVolunteer.id,
      );

    if (updateError) {
      console.error(
        updateError,
      );

      setError(
        `❌ עדכון הפנייה נכשל: ${updateError.message}`,
      );

      setSaving(false);
      return;
    }

    setEditingVolunteer(null);
    setEditingType(null);

    await loadVolunteers();

    setMessage(
      "✅ פנייה ההתנדבות עודכנה בהצלחה!",
    );

    setSaving(false);
  }

  // =========================
  // VOLUNTEER - DELETE
  // =========================

  async function deleteVolunteer(
    item: VolunteerApplication,
  ) {
    const confirmed =
      window.confirm(
        "האם את בטוחה שאת רוצה למחוק את פנייה ההתנדבות?\n\nהפעולה אינה ניתנת לביטול.",
      );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const {
      error: deleteError,
    } = await supabase
      .from(
        "volunteer_applications",
      )
      .delete()
      .eq(
        "id",
        item.id,
      );

    if (deleteError) {
      console.error(
        deleteError,
      );

      setError(
        `❌ המחיקה נכשלה: ${deleteError.message}`,
      );

      return;
    }

    await loadVolunteers();

    setMessage(
      "✅ פנייה ההתנדבות נמחקה בהצלחה.",
    );
  }

  // =========================
  // REFRESH
  // =========================

  async function refreshCurrentSection() {
    setMessage("");
    setError("");

    setLoading(true);

    if (
      activeSection ===
      "content"
    ) {
      await loadContent();
    }

    if (
      activeSection ===
      "messages"
    ) {
      await loadMessages();
    }

    if (
      activeSection ===
      "donations"
    ) {
      await loadDonations();
    }

    if (
      activeSection ===
      "volunteers"
    ) {
      await loadVolunteers();
    }

    setLoading(false);

    setMessage(
      "✅ הנתונים עודכנו.",
    );
  }

  // =========================
  // AUTH CHECK
  // =========================

  if (checkingAuth) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-muted/30"
      >
        <div className="rounded-[2rem] border border-border bg-card p-10 text-center shadow-card">
          <p className="text-lg font-bold text-foreground">
            בודק הרשאות...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // LOGIN
  // =========================

  if (!isAdmin) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8"
      >
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-card sm:p-10">

          <div className="mb-8 rounded-[1.5rem] bg-gradient-to-l from-primary to-leaf p-7 text-center text-primary-foreground shadow-soft">
            <p className="text-sm font-bold opacity-90">
              מצמיחים מהלב
            </p>

            <h1 className="mt-2 font-display text-3xl font-black">
              אזור מנהל
            </h1>

            <p className="mt-2 text-sm opacity-90">
              התחברות למערכת ניהול האתר
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={login}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-bold text-foreground"
              >
                אימייל
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                required
                autoComplete="username"
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-bold text-foreground"
              >
                סיסמה
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill w-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "מתחבר..."
                : "כניסה לדשבורד"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm font-bold text-primary hover:underline"
            >
              חזרה לאתר
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-muted/30"
      >
        <p className="text-lg font-bold text-foreground">
          טוען את לוח הניהול...
        </p>
      </main>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8 rounded-[2rem] bg-gradient-to-l from-primary to-leaf p-8 text-primary-foreground shadow-soft">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-bold opacity-90">
                מצמיחים מהלב
              </p>

              <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
                לוח ניהול
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90">
                מכאן מנהל העמותה יכול לנהל את התוכן והנתונים שמופיעים באתר.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                to="/"
                className="rounded-xl bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                צפייה באתר
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-white/90"
              >
                התנתקות
              </button>

            </div>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm font-bold text-destructive"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-bold text-primary">
            {message}
          </div>
        )}

        {/* NAVIGATION */}

        <div className="mb-6 rounded-[2rem] border border-border bg-card p-3 shadow-card">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

            <button
              type="button"
              onClick={() =>
                setActiveSection("content")
              }
              className={[
                "rounded-2xl px-4 py-4 text-sm font-bold transition",
                activeSection ===
                "content"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground hover:bg-primary/10",
              ].join(" ")}
            >
              🏠 תוכן האתר
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("messages")
              }
              className={[
                "rounded-2xl px-4 py-4 text-sm font-bold transition",
                activeSection ===
                "messages"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground hover:bg-primary/10",
              ].join(" ")}
            >
              💬 פניות
              <span className="mr-2 opacity-80">
                ({messages.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("donations")
              }
              className={[
                "rounded-2xl px-4 py-4 text-sm font-bold transition",
                activeSection ===
                "donations"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground hover:bg-primary/10",
              ].join(" ")}
            >
              ❤️ תרומות
              <span className="mr-2 opacity-80">
                ({donations.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("volunteers")
              }
              className={[
                "rounded-2xl px-4 py-4 text-sm font-bold transition",
                activeSection ===
                "volunteers"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-foreground hover:bg-primary/10",
              ].join(" ")}
            >
              🤝 מתנדבים
              <span className="mr-2 opacity-80">
                ({volunteers.length})
              </span>
            </button>

          </div>
        </div>

        {/* REFRESH */}

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={
              refreshCurrentSection
            }
            className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground shadow-card transition hover:bg-primary/10"
          >
            🔄 רענון נתונים
          </button>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        {activeSection ===
          "content" && (
          <>
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowContentForm(
                    true,
                  )
                }
                className="btn-pill bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
              >
                ＋ הוספת סקשן
              </button>
            </div>

            {showContentForm && (
              <ContentForm
                section={
                  newContentSection
                }
                content={
                  newContentValue
                }
                setSection={
                  setNewContentSection
                }
                setContent={
                  setNewContentValue
                }
                saving={saving}
                onSave={
                  createContent
                }
                onCancel={() => {
                  setShowContentForm(
                    false,
                  );

                  setNewContentSection(
                    "",
                  );

                  setNewContentValue(
                    "{}",
                  );
                }}
              />
            )}

            {sections.length ===
            0 ? (
              <div className="rounded-[2rem] border border-border bg-card p-10 text-center shadow-card">
                <h2 className="text-xl font-black text-foreground">
                  לא נמצא תוכן
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  טבלת site_content ריקה.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

                <aside className="h-fit rounded-[2rem] border border-border bg-card p-4 shadow-card lg:sticky lg:top-6">

                  <h2 className="px-3 py-3 font-display text-lg font-black">
                    תוכן האתר
                  </h2>

                  <div className="space-y-2">
                    {sections.map(
                      (
                        section,
                      ) => {
                        const active =
                          section.section ===
                          selectedSection;

                        return (
                          <div
                            key={
                              section.id
                            }
                            className="flex items-center gap-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                selectSection(
                                  section,
                                )
                              }
                              className={[
                                "flex-1 rounded-2xl px-4 py-3 text-right text-sm font-bold transition-colors",
                                active
                                  ? "bg-primary text-primary-foreground shadow-soft"
                                  : "text-foreground hover:bg-primary/10",
                              ].join(
                                " ",
                              )}
                            >
                              {getSectionName(
                                section.section,
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteContent(
                                  section,
                                )
                              }
                              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20"
                              title="מחיקה"
                            >
                              🗑️
                            </button>
                          </div>
                        );
                      },
                    )}
                  </div>
                </aside>

                <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-7">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        עריכת תוכן
                      </p>

                      <h2 className="mt-1 font-display text-2xl font-black text-foreground">
                        {getSectionName(
                          selectedSection,
                        )}
                      </h2>

                      <p className="mt-1 text-xs text-muted-foreground">
                        section:{" "}
                        {
                          selectedSection
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        saveContent
                      }
                      disabled={
                        saving
                      }
                      className="btn-pill bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving
                        ? "שומר..."
                        : "💾 שמירת שינויים"}
                    </button>

                  </div>

                  <div className="mt-6">

                    <label
                      htmlFor="content-editor"
                      className="mb-2 block text-sm font-bold text-foreground"
                    >
                      תוכן הסקשן
                    </label>

                    <textarea
                      id="content-editor"
                      value={
                        editorValue
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditorValue(
                          event.target
                            .value,
                        )
                      }
                      spellCheck={
                        false
                      }
                      dir="ltr"
                      className="min-h-[500px] w-full rounded-2xl border border-border bg-background p-5 font-mono text-sm leading-7 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                  </div>

                  <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
                    <strong>
                      שימי לב:
                    </strong>{" "}
                    התוכן חייב להיות
                    JSON תקין.
                  </div>

                </section>
              </div>
            )}
          </>
        )}

        {/* ==================================================
            MESSAGES
        ================================================== */}

        {activeSection ===
          "messages" && (
          <AdminCard
            title="💬 פניות יצירת קשר"
            subtitle="כל הפניות שנשלחו דרך טופס יצירת הקשר באתר."
            action={
              <button
                type="button"
                onClick={() =>
                  setShowMessageForm(
                    true,
                  )
                }
                className="btn-pill bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft"
              >
                ＋ הוספת פנייה
              </button>
            }
          >

            {showMessageForm && (
              <ContactForm
                title="הוספת פנייה"
                saving={saving}
                onSave={
                  createMessage
                }
                onCancel={() =>
                  setShowMessageForm(
                    false,
                  )
                }
              />
            )}

            {editingType ===
              "message" &&
              editingMessage && (
                <ContactForm
                  title="עריכת פנייה"
                  initialData={
                    editingMessage
                  }
                  saving={saving}
                  onSave={
                    updateMessage
                  }
                  onCancel={() => {
                    setEditingMessage(
                      null,
                    );

                    setEditingType(
                      null,
                    );
                  }}
                />
              )}

            {messages.length ===
            0 ? (
              <EmptyTable message="אין כרגע פניות להצגה." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-right">

                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-4 text-sm font-black">
                        שם
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        טלפון
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        אימייל
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        נושא
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        הודעה
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        תאריך
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        פעולות
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {messages.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className="border-b border-border last:border-0 hover:bg-muted/40"
                        >
                          <td className="px-4 py-4 font-bold">
                            {
                              item.name
                            }
                          </td>

                          <td className="px-4 py-4">
                            {item.phone ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.email ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.topic ||
                              "-"}
                          </td>

                          <td className="max-w-[350px] px-4 py-4 leading-relaxed">
                            {
                              item.message
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(
                              item.created_at,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">

                            <button
                              type="button"
                              onClick={() => {
                                setEditingMessage(
                                  item,
                                );

                                setEditingType(
                                  "message",
                                );

                                setShowMessageForm(
                                  false,
                                );
                              }}
                              className="ml-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/20"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteMessage(
                                  item,
                                )
                              }
                              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
                            >
                              🗑️
                            </button>

                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>

                </table>
              </div>
            )}
          </AdminCard>
        )}

        {/* ==================================================
            DONATIONS
        ================================================== */}

        {activeSection ===
          "donations" && (
          <AdminCard
            title="❤️ תרומות"
            subtitle="כל התרומות שנרשמו במערכת."
            action={
              <button
                type="button"
                onClick={() =>
                  setShowDonationForm(
                    true,
                  )
                }
                className="btn-pill bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft"
              >
                ＋ הוספת תרומה
              </button>
            }
          >

            {showDonationForm && (
              <DonationForm
                title="הוספת תרומה"
                saving={saving}
                onSave={
                  createDonation
                }
                onCancel={() =>
                  setShowDonationForm(
                    false,
                  )
                }
              />
            )}

            {editingType ===
              "donation" &&
              editingDonation && (
                <DonationForm
                  title="עריכת תרומה"
                  initialData={
                    editingDonation
                  }
                  saving={saving}
                  onSave={
                    updateDonation
                  }
                  onCancel={() => {
                    setEditingDonation(
                      null,
                    );

                    setEditingType(
                      null,
                    );
                  }}
                />
              )}

            {donations.length ===
            0 ? (
              <EmptyTable message="אין כרגע תרומות להצגה." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-right">

                  <thead>
                    <tr className="border-b border-border">

                      <th className="px-4 py-4 text-sm font-black">
                        שם
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        אימייל
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        טלפון
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        סכום
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        סוג תרומה
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        הקדשה
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        תאריך
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        פעולות
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {donations.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className="border-b border-border last:border-0 hover:bg-muted/40"
                        >

                          <td className="px-4 py-4 font-bold">
                            {
                              item.name
                            }
                          </td>

                          <td className="px-4 py-4">
                            {item.email ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.phone ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 font-black text-primary">
                            ₪
                            {Number(
                              item.amount,
                            ).toLocaleString(
                              "he-IL",
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              {item.monthly
                                ? "חודשית"
                                : "חד פעמית"}
                            </span>
                          </td>

                          <td className="max-w-[250px] px-4 py-4">
                            {
                              item.dedication ||
                              "-"
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(
                              item.created_at,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">

                            <button
                              type="button"
                              onClick={() => {
                                setEditingDonation(
                                  item,
                                );

                                setEditingType(
                                  "donation",
                                );

                                setShowDonationForm(
                                  false,
                                );
                              }}
                              className="ml-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/20"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteDonation(
                                  item,
                                )
                              }
                              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
                            >
                              🗑️
                            </button>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>
              </div>
            )}
          </AdminCard>
        )}

        {/* ==================================================
            VOLUNTEERS
        ================================================== */}

        {activeSection ===
          "volunteers" && (
          <AdminCard
            title="🤝 פניות התנדבות"
            subtitle="כל הבקשות והפניות של אנשים המעוניינים להתנדב."
            action={
              <button
                type="button"
                onClick={() =>
                  setShowVolunteerForm(
                    true,
                  )
                }
                className="btn-pill bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft"
              >
                ＋ הוספת פנייה
              </button>
            }
          >

            {showVolunteerForm && (
              <VolunteerForm
                title="הוספת פנייה"
                saving={saving}
                onSave={
                  createVolunteer
                }
                onCancel={() =>
                  setShowVolunteerForm(
                    false,
                  )
                }
              />
            )}

            {editingType ===
              "volunteer" &&
              editingVolunteer && (
                <VolunteerForm
                  title="עריכת פנייה"
                  initialData={
                    editingVolunteer
                  }
                  saving={saving}
                  onSave={
                    updateVolunteer
                  }
                  onCancel={() => {
                    setEditingVolunteer(
                      null,
                    );

                    setEditingType(
                      null,
                    );
                  }}
                />
              )}

            {volunteers.length ===
            0 ? (
              <EmptyTable message="אין כרגע פניות התנדבות להצגה." />
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-right">

                  <thead>
                    <tr className="border-b border-border">

                      <th className="px-4 py-4 text-sm font-black">
                        שם
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        אימייל
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        טלפון
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        תפקיד
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        הודעה
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        תאריך
                      </th>

                      <th className="px-4 py-4 text-sm font-black">
                        פעולות
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {volunteers.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                          className="border-b border-border last:border-0 hover:bg-muted/40"
                        >

                          <td className="px-4 py-4 font-bold">
                            {
                              item.name
                            }
                          </td>

                          <td className="px-4 py-4">
                            {item.email ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.phone ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.role ||
                              "-"}
                          </td>

                          <td className="max-w-[350px] px-4 py-4 leading-relaxed">
                            {
                              item.message ||
                              "-"
                            }
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(
                              item.created_at,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">

                            <button
                              type="button"
                              onClick={() => {
                                setEditingVolunteer(
                                  item,
                                );

                                setEditingType(
                                  "volunteer",
                                );

                                setShowVolunteerForm(
                                  false,
                                );
                              }}
                              className="ml-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/20"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteVolunteer(
                                  item,
                                )
                              }
                              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/20"
                            >
                              🗑️
                            </button>

                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>
              </div>
            )}
          </AdminCard>
        )}

      </div>
    </main>
  );
}

// =========================================================
// ADMIN CARD
// =========================================================

function AdminCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-7">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            ניהול מערכת
          </p>

          <h2 className="mt-1 font-display text-2xl font-black text-foreground">
            {title}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {action}

      </div>

      {children}

    </section>
  );
}

// =========================================================
// CONTACT FORM
// =========================================================

function ContactForm({
  title,
  initialData,
  saving,
  onSave,
  onCancel,
}: {
  title: string;
  initialData?: ContactMessage;
  saving: boolean;
  onSave: (data: {
    name: string;
    phone: string;
    email: string;
    topic: string;
    message: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] =
    useState(
      initialData?.name ?? "",
    );

  const [phone, setPhone] =
    useState(
      initialData?.phone ?? "",
    );

  const [email, setEmail] =
    useState(
      initialData?.email ?? "",
    );

  const [topic, setTopic] =
    useState(
      initialData?.topic ?? "",
    );

  const [message, setMessage] =
    useState(
      initialData?.message ?? "",
    );

  return (
    <FormWrapper
      title={title}
      saving={saving}
      onCancel={onCancel}
      onSave={() =>
        onSave({
          name,
          phone,
          email,
          topic,
          message,
        })
      }
    >

      <InputField
        label="שם"
        value={name}
        onChange={setName}
        required
      />

      <InputField
        label="טלפון"
        value={phone}
        onChange={setPhone}
      />

      <InputField
        label="אימייל"
        value={email}
        onChange={setEmail}
        type="email"
      />

      <InputField
        label="נושא"
        value={topic}
        onChange={setTopic}
      />

      <TextAreaField
        label="הודעה"
        value={message}
        onChange={setMessage}
        required
      />

    </FormWrapper>
  );
}

// =========================================================
// DONATION FORM
// =========================================================

function DonationForm({
  title,
  initialData,
  saving,
  onSave,
  onCancel,
}: {
  title: string;
  initialData?: Donation;
  saving: boolean;
  onSave: (data: {
    name: string;
    email: string;
    phone: string;
    amount: string;
    monthly: boolean;
    dedication: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] =
    useState(
      initialData?.name ?? "",
    );

  const [email, setEmail] =
    useState(
      initialData?.email ?? "",
    );

  const [phone, setPhone] =
    useState(
      initialData?.phone ?? "",
    );

  const [amount, setAmount] =
    useState(
      initialData
        ? String(initialData.amount)
        : "",
    );

  const [monthly, setMonthly] =
    useState(
      initialData?.monthly ??
        false,
    );

  const [dedication, setDedication] =
    useState(
      initialData?.dedication ??
        "",
    );

  return (
    <FormWrapper
      title={title}
      saving={saving}
      onCancel={onCancel}
      onSave={() =>
        onSave({
          name,
          email,
          phone,
          amount,
          monthly,
          dedication,
        })
      }
    >

      <InputField
        label="שם"
        value={name}
        onChange={setName}
        required
      />

      <InputField
        label="אימייל"
        value={email}
        onChange={setEmail}
        type="email"
      />

      <InputField
        label="טלפון"
        value={phone}
        onChange={setPhone}
      />

      <InputField
        label="סכום"
        value={amount}
        onChange={setAmount}
        type="number"
        required
      />

      <div>
        <label className="mb-2 block text-sm font-bold">
          סוג תרומה
        </label>

        <select
          value={
            monthly
              ? "monthly"
              : "single"
          }
          onChange={(event) =>
            setMonthly(
              event.target.value ===
                "monthly",
            )
          }
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        >
          <option value="single">
            חד פעמית
          </option>

          <option value="monthly">
            חודשית
          </option>
        </select>
      </div>

      <TextAreaField
        label="הקדשה"
        value={dedication}
        onChange={setDedication}
      />

    </FormWrapper>
  );
}

// =========================================================
// VOLUNTEER FORM
// =========================================================

function VolunteerForm({
  title,
  initialData,
  saving,
  onSave,
  onCancel,
}: {
  title: string;
  initialData?: VolunteerApplication;
  saving: boolean;
  onSave: (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    message: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] =
    useState(
      initialData?.name ?? "",
    );

  const [email, setEmail] =
    useState(
      initialData?.email ?? "",
    );

  const [phone, setPhone] =
    useState(
      initialData?.phone ?? "",
    );

  const [role, setRole] =
    useState(
      initialData?.role ?? "",
    );

  const [message, setMessage] =
    useState(
      initialData?.message ?? "",
    );

  return (
    <FormWrapper
      title={title}
      saving={saving}
      onCancel={onCancel}
      onSave={() =>
        onSave({
          name,
          email,
          phone,
          role,
          message,
        })
      }
    >

      <InputField
        label="שם"
        value={name}
        onChange={setName}
        required
      />

      <InputField
        label="אימייל"
        value={email}
        onChange={setEmail}
        type="email"
      />

      <InputField
        label="טלפון"
        value={phone}
        onChange={setPhone}
      />

      <InputField
        label="תפקיד"
        value={role}
        onChange={setRole}
      />

      <TextAreaField
        label="הודעה"
        value={message}
        onChange={setMessage}
      />

    </FormWrapper>
  );
}

// =========================================================
// CONTENT FORM
// =========================================================

function ContentForm({
  section,
  content,
  setSection,
  setContent,
  saving,
  onSave,
  onCancel,
}: {
  section: string;
  content: string;
  setSection: (value: string) => void;
  setContent: (value: string) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <FormWrapper
      title="הוספת סקשן חדש"
      saving={saving}
      onCancel={onCancel}
      onSave={onSave}
    >

      <InputField
        label="שם הסקשן"
        value={section}
        onChange={setSection}
        placeholder="לדוגמה: hero"
        required
      />

      <TextAreaField
        label="תוכן JSON"
        value={content}
        onChange={setContent}
        rows={12}
        dir="ltr"
        monospace
      />

    </FormWrapper>
  );
}

// =========================================================
// FORM WRAPPER
// =========================================================

function FormWrapper({
  title,
  children,
  saving,
  onSave,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mb-6 rounded-[2rem] border border-border bg-muted/30 p-5 sm:p-7">

      <h3 className="mb-6 font-display text-xl font-black">
        {title}
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        {children}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-50"
        >
          {saving
            ? "שומר..."
            : "💾 שמירה"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground hover:bg-muted"
        >
          ביטול
        </button>

      </div>

    </div>
  );
}

// =========================================================
// INPUT
// =========================================================

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-foreground">
        {label}
        {required && (
          <span className="mr-1 text-destructive">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

// =========================================================
// TEXTAREA
// =========================================================

function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  rows = 6,
  dir = "rtl",
  monospace = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  dir?: "rtl" | "ltr";
  monospace?: boolean;
}) {
  return (
    <div className="sm:col-span-2">

      <label className="mb-2 block text-sm font-bold text-foreground">
        {label}

        {required && (
          <span className="mr-1 text-destructive">
            *
          </span>
        )}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        rows={rows}
        dir={dir}
        className={[
          "w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          monospace
            ? "font-mono text-sm"
            : "",
        ].join(" ")}
      />

    </div>
  );
}

// =========================================================
// EMPTY TABLE
// =========================================================

function EmptyTable({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-10 text-center">
      <p className="text-sm font-bold text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

// =========================================================
// DATE
// =========================================================

function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleString(
    "he-IL",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  );
}

// =========================================================
// SECTION NAMES
// =========================================================

function getSectionName(
  section: string,
) {
  const names: Record<
    string,
    string
  > = {
    hero: "🏠 אזור ראשי",
    support_cards:
      "❤️ כרטיסי תמיכה",
    services:
      "🤝 תחומי תמיכה",
    stats: "📊 סטטיסטיקות",
    testimonial:
      "💬 המלצה",
  };

  return (
    names[section] ??
    section
  );
}

