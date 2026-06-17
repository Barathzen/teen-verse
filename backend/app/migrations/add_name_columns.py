"""
Migration script to add 'name' column to assessments table
and 'name' + 'created_by' columns to simulations table.

Run with: python app/migrations/add_name_columns.py
"""

import sqlite3
import os

# Path relative to the backend directory
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "teenverse.db")
DB_PATH = os.path.abspath(DB_PATH)


def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database file not found: {DB_PATH}")
        return

    print(f"Migrating database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check existing columns in assessments
    cursor.execute("PRAGMA table_info(assessments)")
    assessment_columns = [row[1] for row in cursor.fetchall()]
    
    if "name" not in assessment_columns:
        print("Adding 'name' column to assessments table...")
        cursor.execute("ALTER TABLE assessments ADD COLUMN name TEXT DEFAULT ''")
        print("  ✓ Done")
    else:
        print("  • 'name' column already exists in assessments table")

    # Check existing columns in simulations
    cursor.execute("PRAGMA table_info(simulations)")
    simulation_columns = [row[1] for row in cursor.fetchall()]
    
    if "name" not in simulation_columns:
        print("Adding 'name' column to simulations table...")
        cursor.execute("ALTER TABLE simulations ADD COLUMN name TEXT DEFAULT ''")
        print("  ✓ Done")
    else:
        print("  • 'name' column already exists in simulations table")

    if "created_by" not in simulation_columns:
        print("Adding 'created_by' column to simulations table...")
        cursor.execute("ALTER TABLE simulations ADD COLUMN created_by INTEGER REFERENCES users(id)")
        print("  ✓ Done")
    else:
        print("  • 'created_by' column already exists in simulations table")

    conn.commit()
    conn.close()
    print("\n✅ Migration completed successfully!")


if __name__ == "__main__":
    migrate()
