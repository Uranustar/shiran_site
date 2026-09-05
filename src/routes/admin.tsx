 ```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

/* =========================================================
   TABLES
========================================================= */

const TABLES = [
  {
    name: "admin_users",
    label: "משתמשי מנהל",
  },
  {
    name: "contact_messages",
    label: "פניות צור קשר",
  },
  {
    name: "donations",
    label: "תרומות",
  },
  {
    name: "site_content",
    label: "תוכן האתר",
  },
  {
    name: "volunteer_applications",
    label: "בקשות התנדבות",
  },
] as const;

type TableName = (typeof TABLES)[number]["name"];

type RowData = Record<string, any>;

/* =========================================================
   ADMIN PAGE
========================================================= */

function AdminPage() {
  const [selectedTable, setSelectedTable] =
    useState<TableName>("contact_messages");

  const [rows, setRows] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [editingRow, setEditingRow] =
    useState<RowData | null>(null);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     CURRENT TABLE LABEL
  ======================================================= */

  const currentTable = TABLES.find(
    (table) => table.name === selectedTable
  );

  /* =======================================================
     READ
  ======================================================= */

  const fetchRows = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from(selectedTable)
      .select("*");

    if (error) {
      console.error(error);
      setError(
        `שגיאה בטעינת הנתונים: ${error.message}`
      );
      setRows([]);
      setColumns([]);
      setLoading(false);
      return;
    }

    const receivedRows = data ?? [];

    setRows(receivedRows);

    /*
      אנחנו מקבלים את שמות העמודות
      מתוך הרשומה הראשונה.
    */
    if (receivedRows.length > 0) {
      setColumns(
        Object.keys(receivedRows[0])
      );
    } else {
      setColumns([]);
    }

    setLoading(false);
  };

  /* =======================================================
     LOAD TABLE
  ======================================================= */

  useEffect(() => {
    setEditingRow(null);
    setShowAddForm(false);
    setSearch("");

    fetchRows();
  }, [selectedTable]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return rows;
    }

    const searchValue =
      search.toLowerCase();

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchValue)
      )
    );
  }, [rows, search]);

  /* =======================================================
     CREATE
  ======================================================= */

  const createRow = async (
    newRow: RowData
  ) => {
    setSaving(true);
    setError("");

    /*
      id בדרך כלל נוצר אוטומטית ב-Supabase.
      לכן לא שולחים אותו ב-INSERT.
    */

    const rowToInsert = {
      ...newRow,
    };

    delete rowToInsert.id;

    const { error } = await supabase
      .from(selectedTable)
      .insert([rowToInsert]);

    if (error) {
      console.error(error);

      setError(
        `שגיאה בהוספת הרשומה: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setShowAddForm(false);

    await fetchRows();

    setSaving(false);
  };

  /* =======================================================
     UPDATE
  ======================================================= */

  const updateRow = async (
    updatedRow: RowData
  ) => {
    setSaving(true);
    setError("");

    if (!updatedRow.id) {
      setError(
        "לא נמצא ID עבור הרשומה."
      );

      setSaving(false);
      return;
    }

    const { id, ...updates } =
      updatedRow;

    const { error } = await supabase
      .from(selectedTable)
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error(error);

      setError(
        `שגיאה בעדכון הרשומה: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setEditingRow(null);

    await fetchRows();

    setSaving(false);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteRow = async (
    row: RowData
  ) => {
    if (!row.id) {
      setError(
        "לא נמצא ID עבור הרשומה."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "האם את בטוחה שאת רוצה למחוק את הרשומה?\n\nהפעולה אינה ניתנת לביטול."
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase
      .from(selectedTable)
      .delete()
      .eq("id", row.id);

    if (error) {
      console.error(error);

      setError(
        `שגיאה במחיקה: ${error.message}`
      );

      setLoading(false);
      return;
    }

    await fetchRows();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="admin-header">

        <div>
          <h1>מערכת ניהול</h1>

          <p>
            ניהול נתוני האתר
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchRows}
          disabled={loading}
        >
          🔄 רענון
        </button>

      </header>

      {/* ===================================================
          TABLE SELECTOR
      =================================================== */}

      <section className="table-selector">

        <h2>בחרי טבלה</h2>

        <div className="table-buttons">

          {TABLES.map((table) => (

            <button
              key={table.name}
              className={
                selectedTable === table.name
                  ? "table-button active"
                  : "table-button"
              }
              onClick={() =>
                setSelectedTable(
                  table.name
                )
              }
            >
              {table.label}
            </button>

          ))}

        </div>

      </section>

      {/* ===================================================
          CURRENT TABLE
      =================================================== */}

      <section className="data-section">

        <div className="data-header">

          <div>
            <h2>
              {currentTable?.label}
            </h2>

            <span className="table-name">
              {selectedTable}
            </span>
          </div>

          <button
            className="add-button"
            onClick={() => {
              setEditingRow(null);
              setShowAddForm(true);
            }}
          >
            ＋ הוספת רשומה
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="error-message">
            ⚠️ {error}
          </div>

        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="toolbar">

          <div className="search-box">

            🔍

            <input
              type="text"
              placeholder="חיפוש ברשומות..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="results-count">
            {filteredRows.length} רשומות
          </div>

        </div>

        {/* =================================================
            ADD FORM
        ================================================= */}

        {showAddForm && (

          <RowForm
            title="הוספת רשומה חדשה"
            columns={columns.filter(
              (column) =>
                column !== "id"
            )}
            initialData={{}}
            onSave={createRow}
            onCancel={() =>
              setShowAddForm(false)
            }
            saving={saving}
          />

        )}

        {/* =================================================
            EDIT FORM
        ================================================= */}

        {editingRow && (

          <RowForm
            title="עריכת רשומה"
            columns={columns}
            initialData={editingRow}
            onSave={updateRow}
            onCancel={() =>
              setEditingRow(null)
            }
            saving={saving}
          />

        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="loading">
            <div className="spinner" />
            <p>טוען נתונים...</p>
          </div>

        ) : filteredRows.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📂
            </div>

            <h3>
              אין נתונים להצגה
            </h3>

            <p>
              {search
                ? "לא נמצאו תוצאות לחיפוש."
                : "עדיין אין רשומות בטבלה הזו."}
            </p>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  {columns.map(
                    (column) => (

                      <th
                        key={column}
                      >
                        {formatColumnName(
                          column
                        )}
                      </th>

                    )
                  )}

                  <th>
                    פעולות
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRows.map(
                  (row, index) => (

                    <tr
                      key={
                        row.id ??
                        index
                      }
                    >

                      {columns.map(
                        (column) => (

                          <td
                            key={column}
                          >
                            {formatValue(
                              row[column]
                            )}
                          </td>

                        )
                      )}

                      <td className="actions-cell">

                        <button
                          className="edit-button"
                          onClick={() =>
                            setEditingRow({
                              ...row,
                            })
                          }
                        >
                          ✏️ עריכה
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteRow(row)
                          }
                        >
                          🗑️ מחיקה
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: 100vh;
          background: #f5f7fb;
          padding: 35px;
          direction: rtl;
          font-family: Arial, sans-serif;
          color: #1f2937;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 25px 30px;
          border-radius: 16px;
          margin-bottom: 25px;
          box-shadow:
            0 4px 20px rgba(0,0,0,0.06);
        }

        .admin-header h1 {
          margin: 0 0 8px;
          font-size: 30px;
        }

        .admin-header p {
          margin: 0;
          color: #6b7280;
        }

        button {
          font-family: inherit;
        }

        .refresh-button {
          border: none;
          background: #f1f5f9;
          padding: 11px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-button:hover {
          background: #e2e8f0;
        }

        .table-selector {
          background: white;
          padding: 25px;
          border-radius: 16px;
          margin-bottom: 25px;
          box-shadow:
            0 4px 20px rgba(0,0,0,0.06);
        }

        .table-selector h2 {
          margin-top: 0;
          margin-bottom: 18px;
          font-size: 19px;
        }

        .table-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .table-button {
          border: 1px solid #e5e7eb;
          background: white;
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s;
        }

        .table-button:hover {
          background: #f8fafc;
        }

        .table-button.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .data-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow:
            0 4px 20px rgba(0,0,0,0.06);
        }

        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .data-header h2 {
          margin: 0 0 5px;
          font-size: 23px;
        }

        .table-name {
          color: #9ca3af;
          font-size: 13px;
          direction: ltr;
          display: inline-block;
        }

        .add-button {
          border: none;
          background: #111827;
          color: white;
          padding: 12px 20px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 14px;
        }

        .add-button:hover {
          background: #374151;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 18px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          padding: 0 13px;
          max-width: 400px;
          width: 100%;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          padding: 12px 5px;
          font-size: 14px;
        }

        .results-count {
          color: #6b7280;
          font-size: 14px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .admin-table th {
          background: #f8fafc;
          padding: 14px;
          text-align: right;
          font-size: 13px;
          color: #475569;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 13px 14px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          max-width: 300px;
          word-break: break-word;
          font-size: 14px;
        }

        .admin-table tbody tr:hover {
          background: #fafafa;
        }

        .admin-table tbody tr:last-child td {
          border-bottom: none;
        }

        .actions-cell {
          white-space: nowrap;
        }

        .edit-button,
        .delete-button {
          border: none;
          padding: 7px 11px;
          border-radius: 7px;
          cursor: pointer;
          margin-left: 6px;
          font-size: 13px;
        }

        .edit-button {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .edit-button:hover {
          background: #dbeafe;
        }

        .delete-button {
          background: #fef2f2;
          color: #dc2626;
        }

        .delete-button:hover {
          background: #fee2e2;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .spinner {
          width: 35px;
          height: 35px;
          border: 4px solid #e5e7eb;
          border-top-color: #111827;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          text-align: center;
          padding: 70px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 45px;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
        }

        /* ===============================
           FORM
        =============================== */

        .row-form {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 25px;
          margin-bottom: 25px;
        }

        .row-form h3 {
          margin-top: 0;
          margin-bottom: 22px;
          font-size: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(240px, 1fr));
          gap: 17px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          width: 100%;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          padding: 11px;
          outline: none;
          font-family: inherit;
          font-size: 14px;
        }

        .form-field textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          border-color: #64748b;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }

        .save-button {
          border: none;
          background: #111827;
          color: white;
          padding: 11px 22px;
          border-radius: 8px;
          cursor: pointer;
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-button {
          border: 1px solid #d1d5db;
          background: white;
          padding: 11px 22px;
          border-radius: 8px;
          cursor: pointer;
        }

        @media (max-width: 700px) {

          .admin-page {
            padding: 15px;
          }

          .admin-header {
            padding: 20px;
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .data-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

        }

      `}</style>
    </div>
  );
}

/* =========================================================
   ROW FORM
========================================================= */

function RowForm({
  title,
  columns,
  initialData,
  onSave,
  onCancel,
  saving,
}: {
  title: string;
  columns: string[];
  initialData: RowData;
  onSave: (data: RowData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] =
    useState<RowData>({
      ...initialData,
    });

  const handleChange = (
    column: string,
    value: any
  ) => {
    setFormData((previous) => ({
      ...previous,
      [column]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="row-form">

      <h3>{title}</h3>

      <div className="form-grid">

        {columns
          .filter(
            (column) =>
              column !== "id"
          )
          .map((column) => {

            const value =
              formData[column];

            /*
              זיהוי שדות לפי שם
            */

            const isLongText =
              [
                "message",
                "description",
                "content",
                "text",
                "notes",
                "details",
                "address",
              ].some((name) =>
                column
                  .toLowerCase()
                  .includes(name)
              );

            const isBoolean =
              typeof value ===
              "boolean";

            return (
              <div
                className={
                  isLongText
                    ? "form-field full-width"
                    : "form-field"
                }
                key={column}
              >

                <label>
                  {formatColumnName(
                    column
                  )}
                </label>

                {isBoolean ? (

                  <select
                    value={
                      value
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      handleChange(
                        column,
                        e.target
                          .value ===
                          "true"
                      )
                    }
                  >
                    <option value="false">
                      לא
                    </option>

                    <option value="true">
                      כן
                    </option>

                  </select>

                ) : isLongText ? (

                  <textarea
                    value={
                      value ??
                      ""
                    }
                    onChange={(e) =>
                      handleChange(
                        column,
                        e.target.value
                      )
                    }
                  />

                ) : (

                  <input
                    type={
                      typeof value ===
                      "number"
                        ? "number"
                        : "text"
                    }
                    value={
                      value ??
                      ""
                    }
                    onChange={(e) => {

                      let newValue =
                        e.target.value;

                      if (
                        typeof value ===
                        "number"
                      ) {
                        newValue =
                          e.target.value ===
                          ""
                            ? ""
                            : Number(
                                e.target.value
                              );
                      }

                      handleChange(
                        column,
                        newValue
                      );

                    }}
                  />

                )}

              </div>
            );

          })}

      </div>

      <div className="form-actions">

        <button
          className="save-button"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "שומר..."
            : "💾 שמירה"}
        </button>

        <button
          className="cancel-button"
          onClick={onCancel}
          disabled={saving}
        >
          ביטול
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   FORMAT COLUMN NAME
========================================================= */

function formatColumnName(
  column: string
) {
  const names: Record<
    string,
    string
  > = {
    id: "מזהה",
    name: "שם",
    full_name: "שם מלא",
    email: "אימייל",
    phone: "טלפון",
    message: "הודעה",
    subject: "נושא",
    amount: "סכום",
    status: "סטטוס",
    created_at: "נוצר בתאריך",
    updated_at: "עודכן בתאריך",
    content: "תוכן",
    title: "כותרת",
    description: "תיאור",
    address: "כתובת",
    notes: "הערות",
  };

  if (names[column]) {
    return names[column];
  }

  return column
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

/* =========================================================
   FORMAT VALUE
========================================================= */

function formatValue(
  value: any
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "כן"
      : "לא";
  }

  if (
    typeof value ===
    "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  /*
    מקצר טקסטים ארוכים
  */

  const text =
    String(value);

  if (text.length > 150) {
    return (
      text.substring(
        0,
        150
      ) + "..."
    );
  }

  return text;
}
```
