"""
Migration script to add 'name' column to assessments table
and 'name' + 'created_by' columns to simulations table.

Uses SQLAlchemy so it works with both SQLite and PostgreSQL.

Run with: python -m app.migrations.add_name_columns
"""

from sqlalchemy import text

from app.core.database import engine


def _column_exists(conn, table: str, column: str) -> bool:
    """Check if a column exists in a PostgreSQL table."""
    result = conn.execute(
        text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = :table AND column_name = :column"
        ),
        {"table": table, "column": column},
    )
    return result.fetchone() is not None


def migrate():
    print(f"Migrating database: {engine.url}")

    with engine.begin() as conn:
        # -- assessments.name ---------------------------------------------------
        if not _column_exists(conn, "assessments", "name"):
            print("Adding 'name' column to assessments table...")
            conn.execute(text("ALTER TABLE assessments ADD COLUMN name VARCHAR(255) DEFAULT ''"))
            print("  ✓ Done")
        else:
            print("  • 'name' column already exists in assessments table")

        # -- simulations.name ---------------------------------------------------
        if not _column_exists(conn, "simulations", "name"):
            print("Adding 'name' column to simulations table...")
            conn.execute(text("ALTER TABLE simulations ADD COLUMN name VARCHAR(255) DEFAULT ''"))
            print("  ✓ Done")
        else:
            print("  • 'name' column already exists in simulations table")

        # -- simulations.created_by ---------------------------------------------
        if not _column_exists(conn, "simulations", "created_by"):
            print("Adding 'created_by' column to simulations table...")
            conn.execute(
                text(
                    "ALTER TABLE simulations ADD COLUMN created_by INTEGER "
                    "REFERENCES users(id)"
                )
            )
            print("  ✓ Done")
        else:
            print("  • 'created_by' column already exists in simulations table")

    print("\n✅ Migration completed successfully!")


if __name__ == "__main__":
    migrate()
