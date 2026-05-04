PRAGMA foreign_keys = ON;

ALTER TABLE organizations ADD COLUMN clinic_limit INTEGER NOT NULL DEFAULT 3;

UPDATE organizations
SET clinic_limit = 3
WHERE clinic_limit IS NULL OR clinic_limit < 1;

CREATE TABLE IF NOT EXISTS staff_attendance (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    check_in_at TEXT NOT NULL,
    check_out_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(user_id, attendance_date),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attendance_org_date ON staff_attendance(organization_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON staff_attendance(user_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_clinic_id ON staff_attendance(clinic_id);
