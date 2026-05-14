use tauri::State;
use serde::Serialize;
use crate::db::DbPool;

// ─── Row structs ──────────────────────────────────────────────────────────────

#[derive(sqlx::FromRow, Serialize)]
struct ExportDomain {
    id: String,
    name: String,
    vision: String,
    purpose: String,
    current_status: String,
    health_score: f64,
}

#[derive(sqlx::FromRow, Serialize)]
struct ExportGoal {
    id: String,
    title: String,
    description: String,
    target_date: Option<String>,
    status: String,
    priority: String,
    success_criteria: String,
    progress: f64,
    created_at: String,
    domain_name: Option<String>,
}

#[derive(sqlx::FromRow, Serialize)]
struct ExportReflection {
    id: String,
    entry_type: String,
    date: String,
    content: String,
    mood: Option<i64>,
    energy: Option<i64>,
    created_at: String,
}

#[derive(sqlx::FromRow, Serialize)]
struct ExportBlock {
    id: String,
    title: String,
    date: String,
    start_time: String,
    end_time: String,
    block_type: String,
    energy_type: String,
    status: String,
    notes: String,
}

#[derive(sqlx::FromRow, Serialize)]
struct ExportNote {
    id: String,
    note_type: String,
    title: String,
    content: String,
    tags: String,
    source: Option<String>,
    created_at: String,
}

// ─── Query helpers ────────────────────────────────────────────────────────────

async fn query_domains(db: &DbPool) -> Result<Vec<ExportDomain>, String> {
    sqlx::query_as::<_, ExportDomain>(
        "SELECT id, name, vision, purpose, current_status, health_score
         FROM domains WHERE is_active = 1 ORDER BY sort_order",
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())
}

async fn query_goals(db: &DbPool) -> Result<Vec<ExportGoal>, String> {
    sqlx::query_as::<_, ExportGoal>(
        "SELECT g.id, g.title, g.description, g.target_date, g.status, g.priority,
                g.success_criteria, g.progress, g.created_at, d.name AS domain_name
         FROM goals g LEFT JOIN domains d ON g.domain_id = d.id
         ORDER BY g.created_at DESC",
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())
}

async fn query_reflections(db: &DbPool) -> Result<Vec<ExportReflection>, String> {
    sqlx::query_as::<_, ExportReflection>(
        "SELECT id, type AS entry_type, date, content, mood, energy, created_at
         FROM reflection_entries ORDER BY date DESC",
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())
}

async fn query_blocks(db: &DbPool) -> Result<Vec<ExportBlock>, String> {
    sqlx::query_as::<_, ExportBlock>(
        "SELECT id, title, date, start_time, end_time, block_type, energy_type, status, notes
         FROM time_blocks ORDER BY date DESC, start_time ASC",
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())
}

async fn query_notes(db: &DbPool) -> Result<Vec<ExportNote>, String> {
    sqlx::query_as::<_, ExportNote>(
        "SELECT id, type AS note_type, title, content, tags, source, created_at
         FROM knowledge_notes ORDER BY updated_at DESC",
    )
    .fetch_all(db)
    .await
    .map_err(|e| e.to_string())
}

// ─── Format: JSON ─────────────────────────────────────────────────────────────

async fn format_json(scope: &str, db: &DbPool) -> Result<Vec<u8>, String> {
    let mut map = serde_json::Map::new();
    map.insert("exported_at".into(), serde_json::json!(chrono::Utc::now().to_rfc3339()));
    map.insert("version".into(), serde_json::json!("1.0"));
    map.insert("scope".into(), serde_json::json!(scope));

    if scope == "full" || scope == "domains" {
        map.insert("domains".into(), serde_json::to_value(query_domains(db).await?).map_err(|e| e.to_string())?);
    }
    if scope == "full" || scope == "goals" {
        map.insert("goals".into(), serde_json::to_value(query_goals(db).await?).map_err(|e| e.to_string())?);
    }
    if scope == "full" || scope == "reflections" {
        map.insert("reflections".into(), serde_json::to_value(query_reflections(db).await?).map_err(|e| e.to_string())?);
    }
    if scope == "full" || scope == "execution" {
        map.insert("time_blocks".into(), serde_json::to_value(query_blocks(db).await?).map_err(|e| e.to_string())?);
    }
    if scope == "full" || scope == "knowledge" {
        map.insert("knowledge_notes".into(), serde_json::to_value(query_notes(db).await?).map_err(|e| e.to_string())?);
    }

    serde_json::to_vec_pretty(&serde_json::Value::Object(map)).map_err(|e| e.to_string())
}

// ─── Format: Markdown ─────────────────────────────────────────────────────────

async fn format_markdown(scope: &str, db: &DbPool) -> Result<Vec<u8>, String> {
    let mut md = String::new();
    md.push_str("# LENSSTACK Export\n\n");
    md.push_str(&format!("**Exported:** {}\n", chrono::Utc::now().to_rfc3339()));
    md.push_str(&format!("**Scope:** {}\n\n---\n\n", scope));

    if scope == "full" || scope == "domains" {
        md.push_str("## Life Domains\n\n");
        for d in query_domains(db).await? {
            md.push_str(&format!("### {}\n", d.name));
            if !d.vision.is_empty() { md.push_str(&format!("**Vision:** {}\n\n", d.vision)); }
            if !d.purpose.is_empty() { md.push_str(&format!("**Purpose:** {}\n\n", d.purpose)); }
            if !d.current_status.is_empty() { md.push_str(&format!("**Status:** {}\n\n", d.current_status)); }
            md.push_str(&format!("**Health:** {}%\n\n", (d.health_score * 10.0) as i32));
        }
        md.push_str("---\n\n");
    }

    if scope == "full" || scope == "goals" {
        md.push_str("## Goals\n\n");
        for g in query_goals(db).await? {
            md.push_str(&format!("### {} [{}] [{}]\n", g.title, g.priority, g.status));
            if let Some(d) = &g.domain_name { md.push_str(&format!("- **Domain:** {}\n", d)); }
            md.push_str(&format!("- **Progress:** {}%\n", g.progress as i32));
            if let Some(td) = &g.target_date { md.push_str(&format!("- **Target:** {}\n", td)); }
            if !g.description.is_empty() { md.push_str(&format!("- **Description:** {}\n", g.description)); }
            if !g.success_criteria.is_empty() { md.push_str(&format!("- **Success:** {}\n", g.success_criteria)); }
            md.push('\n');
        }
        md.push_str("---\n\n");
    }

    if scope == "full" || scope == "reflections" {
        md.push_str("## Reflections\n\n");
        for r in query_reflections(db).await? {
            md.push_str(&format!("### {} — {}\n", capitalize(&r.entry_type), r.date));
            if let (Some(mood), Some(energy)) = (r.mood, r.energy) {
                md.push_str(&format!("**Mood:** {}/5 | **Energy:** {}/5\n\n", mood, energy));
            }
            let content: serde_json::Value = serde_json::from_str(&r.content).unwrap_or_default();
            if let Some(obj) = content.as_object() {
                for (k, v) in obj {
                    if let Some(s) = v.as_str() {
                        if !s.is_empty() {
                            md.push_str(&format!("**{}:** {}\n\n", k, s));
                        }
                    }
                }
            }
            md.push('\n');
        }
        md.push_str("---\n\n");
    }

    if scope == "full" || scope == "execution" {
        md.push_str("## Time Blocks\n\n");
        let mut current_date = String::new();
        for b in query_blocks(db).await? {
            if b.date != current_date {
                md.push_str(&format!("### {}\n\n", b.date));
                md.push_str("| Time | Title | Type | Status |\n");
                md.push_str("|------|-------|------|--------|\n");
                current_date = b.date.clone();
            }
            md.push_str(&format!(
                "| {}-{} | {} | {} | {} |\n",
                b.start_time, b.end_time, b.title, b.block_type, b.status
            ));
        }
        md.push_str("\n---\n\n");
    }

    if scope == "full" || scope == "knowledge" {
        md.push_str("## Knowledge Notes\n\n");
        for n in query_notes(db).await? {
            md.push_str(&format!("### {} [{}]\n", n.title, n.note_type));
            let tags: Vec<String> = serde_json::from_str(&n.tags).unwrap_or_default();
            if !tags.is_empty() {
                md.push_str(&format!("**Tags:** {}\n\n", tags.join(", ")));
            }
            if !n.content.is_empty() { md.push_str(&format!("{}\n\n", n.content)); }
            if let Some(src) = &n.source { md.push_str(&format!("*Source: {}*\n\n", src)); }
        }
    }

    Ok(md.into_bytes())
}

// ─── Format: CSV ─────────────────────────────────────────────────────────────

async fn format_csv(scope: &str, db: &DbPool) -> Result<Vec<u8>, String> {
    let csv = match scope {
        "goals" => {
            let mut s = "id,title,domain,status,priority,progress,target_date,created_at\n".to_string();
            for g in query_goals(db).await? {
                s.push_str(&format!(
                    "{},{},{},{},{},{},{},{}\n",
                    g.id, csv_field(&g.title),
                    csv_field(g.domain_name.as_deref().unwrap_or("")),
                    g.status, g.priority, g.progress as i32,
                    g.target_date.as_deref().unwrap_or(""),
                    g.created_at,
                ));
            }
            s
        }
        "reflections" => {
            let mut s = "id,type,date,mood,energy,created_at\n".to_string();
            for r in query_reflections(db).await? {
                s.push_str(&format!(
                    "{},{},{},{},{},{}\n",
                    r.id, r.entry_type, r.date,
                    r.mood.map(|v| v.to_string()).unwrap_or_default(),
                    r.energy.map(|v| v.to_string()).unwrap_or_default(),
                    r.created_at,
                ));
            }
            s
        }
        "execution" => {
            let mut s = "id,date,start_time,end_time,title,type,energy,status\n".to_string();
            for b in query_blocks(db).await? {
                s.push_str(&format!(
                    "{},{},{},{},{},{},{},{}\n",
                    b.id, b.date, b.start_time, b.end_time,
                    csv_field(&b.title), b.block_type, b.energy_type, b.status,
                ));
            }
            s
        }
        "knowledge" => {
            let mut s = "id,type,title,tags,created_at\n".to_string();
            for n in query_notes(db).await? {
                let tags: Vec<String> = serde_json::from_str(&n.tags).unwrap_or_default();
                s.push_str(&format!(
                    "{},{},{},{},{}\n",
                    n.id, n.note_type, csv_field(&n.title),
                    csv_field(&tags.join("; ")), n.created_at,
                ));
            }
            s
        }
        _ => return Err("CSV format only supports single-scope exports (goals, reflections, execution, knowledge). Use json or markdown for full exports.".to_string()),
    };
    Ok(csv.into_bytes())
}

fn csv_field(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

// ─── Format: Encrypted ───────────────────────────────────────────────────────

fn format_encrypted(json_bytes: &[u8], password: &str) -> Result<Vec<u8>, String> {
    use aes_gcm::{Aes256Gcm, Key, Nonce};
    use aes_gcm::aead::{Aead, KeyInit};
    use sha2::{Sha256, Digest};
    use rand::RngCore;

    let mut salt = [0u8; 16];
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut salt);
    rand::thread_rng().fill_bytes(&mut nonce_bytes);

    // Key derivation: 100,000 rounds of SHA-256 (comparable to PBKDF2)
    let mut key_bytes = [0u8; 32];
    {
        let mut h = Sha256::new();
        h.update(&salt);
        h.update(password.as_bytes());
        let d = h.finalize();
        key_bytes.copy_from_slice(&d);
    }
    for _ in 0..99_999 {
        let mut h = Sha256::new();
        h.update(&key_bytes);
        let d = h.finalize();
        key_bytes.copy_from_slice(&d);
    }

    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, json_bytes)
        .map_err(|_| "Encryption failed".to_string())?;

    // File format: magic(6) + salt(16) + nonce(12) + ciphertext
    let mut output = b"LENSV1".to_vec();
    output.extend_from_slice(&salt);
    output.extend_from_slice(&nonce_bytes);
    output.extend_from_slice(&ciphertext);
    Ok(output)
}

// ─── Utilities ────────────────────────────────────────────────────────────────

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().to_string() + c.as_str(),
    }
}

// ─── Command ──────────────────────────────────────────────────────────────────

/// Export app data to a file. Format: json | markdown | csv | encrypted. Scope: full | goals | reflections | execution | knowledge.
#[tauri::command]
pub async fn export_data(
    format: String,
    scope: String,
    output_path: String,
    password: Option<String>,
    db: State<'_, DbPool>,
) -> Result<(), String> {
    let bytes = match format.as_str() {
        "json" => format_json(&scope, db.inner()).await?,
        "markdown" | "md" => format_markdown(&scope, db.inner()).await?,
        "csv" => format_csv(&scope, db.inner()).await?,
        "encrypted" => {
            let pw = password.ok_or("Password required for encrypted export")?;
            if pw.is_empty() {
                return Err("Password cannot be empty for encrypted export".to_string());
            }
            let json = format_json(&scope, db.inner()).await?;
            format_encrypted(&json, &pw)?
        }
        other => return Err(format!("Unknown format: {}", other)),
    };

    std::fs::write(&output_path, bytes).map_err(|e| e.to_string())
}
