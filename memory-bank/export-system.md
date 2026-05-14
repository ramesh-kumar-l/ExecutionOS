# Export System — LENSSTACK + X10THINK

## Philosophy
The user fully owns all data. Export is a first-class feature, not an afterthought.

## Export Formats

### Markdown
- Best for: human reading, Obsidian, notes apps
- Scope: goals, reflections, notes, context snapshots, decisions
- Structure: folder per domain, one file per entry
- Frontmatter: YAML metadata per file

### JSON
- Best for: data migration, developer access, backup
- Scope: full database dump in structured JSON
- Format: single file with all entities, or split by module
- Schema version included for forward compatibility

### CSV
- Best for: spreadsheet analysis, data science
- Scope: time blocks, goals, execution data, health metrics
- One CSV per data type

### PDF
- Best for: printing, sharing, archiving
- Scope: life summary, goal reports, reflection journals
- Rendered via Rust PDF generation (printpdf crate)

## Export Scopes

| Scope | Includes |
|-------|----------|
| Full export | Everything |
| Life domains | Domains + visions + purposes |
| Goals | Goals + milestones + progress |
| Execution | Time blocks + focus sessions |
| Reflections | All reflection entries |
| Knowledge | Notes + knowledge graph |
| Context | Snapshots + decisions + interruptions |

## Encrypted Backup
- Format: AES-256-GCM encrypted JSON blob
- Key derivation: PBKDF2 from user password
- Salt: random 32-byte, stored in backup header
- Use case: full backup/restore between devices

## Import / Restore
- Import from encrypted backup (same app version or newer)
- Import from JSON export (migration from other apps)
- Schema migration handled automatically
- Conflict resolution: newer timestamp wins

## Data Structure for Markdown Export
```
export/
├── README.md           (export metadata, date, version)
├── life-map.md         (all domains overview)
├── domains/
│   ├── health.md
│   ├── career.md
│   └── ...
├── goals/
│   ├── active/
│   │   └── goal-title.md
│   └── completed/
├── reflections/
│   ├── daily/
│   │   └── 2026-05-14.md
│   └── weekly/
│       └── 2026-W20.md
├── knowledge/
│   └── note-title.md
└── context/
    ├── snapshots/
    └── decisions/
```

## Rust Implementation Plan
```rust
// Export command
#[tauri::command]
async fn export_data(
    format: ExportFormat,
    scope: ExportScope,
    output_path: String,
    password: Option<String>,  // for encrypted backup
    db: State<DbPool>,
) -> Result<ExportResult, String>

// ExportFormat enum
enum ExportFormat { Markdown, Json, Csv, Pdf, EncryptedBackup }

// ExportScope enum  
enum ExportScope { Full, Domains, Goals, Execution, Reflections, Knowledge, Context }
```

## Portability Guarantee
- Exported Markdown is valid CommonMark
- Exported JSON is versioned with schema
- No proprietary formats
- Export works fully offline
- No internet required for any export

## Backup Schedule (User Configurable)
- Manual: user-triggered
- Automatic: daily/weekly to user-specified folder
- Retention: keep last N backups (configurable)
