use tauri::State;
use serde::{Deserialize, Serialize};
use crate::db::DbPool;

// ─── Internal helpers ─────────────────────────────────────────────────────────

#[derive(sqlx::FromRow)]
struct AiConfig {
    ollama_url: String,
    ollama_model: String,
    ai_enabled: bool,
}

#[derive(sqlx::FromRow)]
struct BlockSummary {
    title: String,
    start_time: String,
    end_time: String,
}

#[derive(sqlx::FromRow)]
struct GoalSummary {
    title: String,
    priority: String,
}

#[derive(sqlx::FromRow)]
struct GoalAlignment {
    title: String,
    priority: String,
    domain_name: Option<String>,
    progress: f64,
}

#[derive(Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    format: String,
}

#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
}

// ─── Public response types ────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIBriefing {
    pub focus: String,
    pub key_blocks: Vec<String>,
    pub alert: Option<String>,
    pub question: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIInsight {
    pub insight: String,
    pub reasoning: String,
    pub suggestion: String,
    pub confidence: String,
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async fn load_ai_config(db: &DbPool) -> Result<AiConfig, String> {
    sqlx::query_as::<_, AiConfig>(
        "SELECT ollama_url, ollama_model, ai_enabled FROM user_settings WHERE id = 1",
    )
    .fetch_one(db)
    .await
    .map_err(|e| e.to_string())
}

async fn ollama_generate(url: &str, model: &str, prompt: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())?;

    let body = OllamaRequest {
        model: model.to_string(),
        prompt,
        stream: false,
        format: "json".to_string(),
    };

    let resp = client
        .post(format!("{}/api/generate", url))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Ollama unreachable: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("Ollama returned status {}", resp.status()));
    }

    let parsed: OllamaResponse = resp.json().await.map_err(|e| e.to_string())?;
    Ok(parsed.response)
}

// ─── Tauri commands ───────────────────────────────────────────────────────────

/// Ping Ollama and return connection status without throwing an error.
#[tauri::command]
pub async fn check_ai_connection(db: State<'_, DbPool>) -> Result<ConnectionStatus, String> {
    let config = load_ai_config(db.inner()).await?;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    match client
        .get(format!("{}/api/tags", config.ollama_url))
        .send()
        .await
    {
        Ok(r) if r.status().is_success() => Ok(ConnectionStatus {
            connected: true,
            model: config.ollama_model,
        }),
        _ => Ok(ConnectionStatus {
            connected: false,
            model: config.ollama_model,
        }),
    }
}

/// Generate a strategic briefing for today from the user's schedule and active goals.
#[tauri::command]
pub async fn get_daily_briefing(db: State<'_, DbPool>) -> Result<AIBriefing, String> {
    let config = load_ai_config(db.inner()).await?;
    if !config.ai_enabled {
        return Err("AI features are disabled in settings".to_string());
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    let blocks = sqlx::query_as::<_, BlockSummary>(
        "SELECT title, start_time, end_time FROM time_blocks
         WHERE date = ? ORDER BY start_time",
    )
    .bind(&today)
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let goals = sqlx::query_as::<_, GoalSummary>(
        "SELECT title, priority FROM goals WHERE status = 'active'
         ORDER BY CASE priority
           WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4
         END LIMIT 5",
    )
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    let blocks_text = if blocks.is_empty() {
        "No blocks scheduled today.".to_string()
    } else {
        blocks
            .iter()
            .map(|b| format!("- {} ({}-{})", b.title, b.start_time, b.end_time))
            .collect::<Vec<_>>()
            .join("\n")
    };

    let goals_text = if goals.is_empty() {
        "No active goals.".to_string()
    } else {
        goals
            .iter()
            .map(|g| format!("- {} [{}]", g.title, g.priority))
            .collect::<Vec<_>>()
            .join("\n")
    };

    let prompt = format!(
        "You are a strategic life advisor. Analyze this person's day ({today}).\n\
         Schedule:\n{blocks_text}\n\nActive goals:\n{goals_text}\n\n\
         Respond ONLY with valid JSON:\n\
         {{\"focus\":\"one clear sentence on what to focus on today\",\
         \"key_blocks\":[\"one brief insight about a key block\"],\
         \"alert\":null,\
         \"question\":\"one thoughtful reflective question for today\"}}"
    );

    let raw = ollama_generate(&config.ollama_url, &config.ollama_model, prompt).await?;
    serde_json::from_str::<AIBriefing>(&raw)
        .map_err(|_| "AI returned an unexpected format. Try again.".to_string())
}

/// Generate tailored reflection questions for the given review type.
#[tauri::command]
pub async fn generate_reflection_questions(
    reflection_type: String,
    db: State<'_, DbPool>,
) -> Result<Vec<String>, String> {
    let config = load_ai_config(db.inner()).await?;
    if !config.ai_enabled {
        return Err("AI features are disabled in settings".to_string());
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let prompt = format!(
        "Generate 4 thoughtful, specific reflection questions for a {reflection_type} review on {today}.\n\
         Questions should be introspective and growth-oriented.\n\
         Respond ONLY with a valid JSON array of strings:\n\
         [\"Question 1?\", \"Question 2?\", \"Question 3?\", \"Question 4?\"]"
    );

    let raw = ollama_generate(&config.ollama_url, &config.ollama_model, prompt).await?;
    serde_json::from_str::<Vec<String>>(&raw)
        .map_err(|_| "AI returned an unexpected format. Try again.".to_string())
}

/// Analyze active goals for strategic alignment across life domains.
#[tauri::command]
pub async fn analyze_goal_alignment(db: State<'_, DbPool>) -> Result<Vec<AIInsight>, String> {
    let config = load_ai_config(db.inner()).await?;
    if !config.ai_enabled {
        return Err("AI features are disabled in settings".to_string());
    }

    let goals = sqlx::query_as::<_, GoalAlignment>(
        "SELECT g.title, g.priority, d.name AS domain_name, g.progress
         FROM goals g LEFT JOIN domains d ON g.domain_id = d.id
         WHERE g.status = 'active'
         ORDER BY g.progress ASC LIMIT 10",
    )
    .fetch_all(db.inner())
    .await
    .map_err(|e| e.to_string())?;

    if goals.is_empty() {
        return Ok(vec![]);
    }

    let goals_text = goals
        .iter()
        .map(|g| {
            format!(
                "- {} | {} | {} | {}%",
                g.title,
                g.domain_name.as_deref().unwrap_or("Unknown"),
                g.priority,
                g.progress as i32
            )
        })
        .collect::<Vec<_>>()
        .join("\n");

    let prompt = format!(
        "Analyze these active goals for strategic alignment and balance.\n\n\
         Goals (title | domain | priority | progress):\n{goals_text}\n\n\
         Provide 2-4 concise insights. Respond ONLY with valid JSON:\n\
         [{{\"insight\":\"brief insight title\",\"reasoning\":\"why this matters\",\
         \"suggestion\":\"one specific actionable step\",\"confidence\":\"high\"}}]\n\
         confidence must be high, medium, or low."
    );

    let raw = ollama_generate(&config.ollama_url, &config.ollama_model, prompt).await?;
    serde_json::from_str::<Vec<AIInsight>>(&raw)
        .map_err(|_| "AI returned an unexpected format. Try again.".to_string())
}
