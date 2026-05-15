-- Migration 003: FTS5 sync triggers for knowledge notes + performance indexes

-- Keep knowledge_notes_fts in sync on INSERT
CREATE TRIGGER IF NOT EXISTS knowledge_notes_ai
AFTER INSERT ON knowledge_notes BEGIN
  INSERT INTO knowledge_notes_fts(rowid, title, content, tags)
  VALUES (new.rowid, new.title, new.content, new.tags);
END;

-- Keep knowledge_notes_fts in sync on DELETE
CREATE TRIGGER IF NOT EXISTS knowledge_notes_ad
AFTER DELETE ON knowledge_notes BEGIN
  INSERT INTO knowledge_notes_fts(knowledge_notes_fts, rowid, title, content, tags)
  VALUES ('delete', old.rowid, old.title, old.content, old.tags);
END;

-- Keep knowledge_notes_fts in sync on UPDATE (delete old, insert new)
CREATE TRIGGER IF NOT EXISTS knowledge_notes_au
AFTER UPDATE ON knowledge_notes BEGIN
  INSERT INTO knowledge_notes_fts(knowledge_notes_fts, rowid, title, content, tags)
  VALUES ('delete', old.rowid, old.title, old.content, old.tags);
  INSERT INTO knowledge_notes_fts(rowid, title, content, tags)
  VALUES (new.rowid, new.title, new.content, new.tags);
END;

-- Populate FTS index for any pre-existing rows
INSERT INTO knowledge_notes_fts(knowledge_notes_fts) VALUES ('rebuild');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_updated_at ON knowledge_notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_notes_type ON knowledge_notes(type);
