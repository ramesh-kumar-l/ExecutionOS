# Sync Strategy — LENSSTACK + X10THINK

## v1 Stance: No Sync Required
The v1 product is single-device, offline-first. Sync is a v2+ feature.

## Why No Sync in v1
1. Sync introduces significant complexity (conflict resolution, auth, server)
2. Offline-first principle satisfied without sync
3. Local backup + manual transfer covers most user needs
4. Premature sync infrastructure would compromise v1 quality
5. Most elite performers use one primary device

## v1 "Sync" Options (Manual)
1. **Encrypted backup export** → copy file to another device → import
2. **Folder-based sync**: user can point backup to Dropbox/iCloud folder (OS handles it)
3. **JSON export/import**: portable data migration

## v2 Sync Architecture (Future Design)

### Approach: CRDTs + Encrypted Cloud
- All mutations are CRDTs (conflict-free replicated data types)
- Device IDs for conflict tracking
- End-to-end encrypted sync (server sees only ciphertext)
- User-controlled sync provider (own server, S3-compatible, or hosted)

### Sync Providers (Planned)
- Self-hosted: user's own S3-compatible storage
- Hosted: optional Lensstack sync service (privacy-preserving)
- Local network: same-network device sync (no cloud)

### What Syncs
- All SQLite data (goals, time blocks, reflections, etc.)
- Settings
- Vector embeddings (optional, large)

### What Never Syncs
- Ollama model files (device-specific, too large)
- Local AI inference results (regenerated on-device)

## Conflict Resolution Strategy (v2)
- **Timestamps**: last-write-wins for simple fields
- **CRDTs**: for list-type fields (tags, linked items)
- **Manual merge UI**: for conflicting narrative content (reflections, notes)
- **No silent overwrites**: user sees conflict, chooses resolution

## Privacy in Sync (v2)
- E2E encryption: client encrypts before upload
- Server stores only ciphertext + metadata (timestamps, sizes)
- Keys never leave device
- Sync password ≠ app password (separate key derivation)

## Decision Record
**Decision**: No sync in v1.
**Rationale**: Sync complexity would delay v1 and compromise quality. Backup-based migration covers v1 needs. Sync will be designed properly in v2 with CRDT foundation.
**Review date**: After v1 ships.
