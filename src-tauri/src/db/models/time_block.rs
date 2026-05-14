use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct TimeBlock {
    pub id: String,
    pub title: String,
    pub date: String,
    pub start_time: String,
    pub end_time: String,
    pub goal_id: Option<String>,
    pub domain_id: Option<String>,
    pub block_type: String,
    pub energy_type: String,
    pub status: String,
    pub recurring_rule_id: Option<String>,
    pub notes: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTimeBlockInput {
    pub title: String,
    pub date: String,
    pub start_time: String,
    pub end_time: String,
    pub goal_id: Option<String>,
    pub domain_id: Option<String>,
    pub block_type: String,
    pub energy_type: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FocusSession {
    pub id: String,
    pub time_block_id: Option<String>,
    pub goal_id: Option<String>,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub planned_duration_minutes: i64,
    pub actual_duration_minutes: Option<i64>,
    pub interruptions: i64,
    pub notes: String,
}
