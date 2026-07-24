import Database from "better-sqlite3";
import { migrate } from "../lib/db/migrations";

describe("Database migrations", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    migrate(db);
  });

  afterEach(() => {
    db.close();
  });

  it("should create all tables", () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("workspaces");
    expect(tableNames).toContain("users");
    expect(tableNames).toContain("user_profiles");
    expect(tableNames).toContain("teams");
    expect(tableNames).toContain("team_members");
    expect(tableNames).toContain("projects");
    expect(tableNames).toContain("tasks");
  });

  it("should enforce foreign keys", () => {
    const insertUser = db.prepare(
      "INSERT INTO users (id, email, name, role, workspace_id) VALUES (?, ?, ?, ?, ?)"
    );

    expect(() => {
      insertUser.run("user-1", "test@example.com", "Test", "member", "invalid-workspace");
    }).toThrow();
  });
});
