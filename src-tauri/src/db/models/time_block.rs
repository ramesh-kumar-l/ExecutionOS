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

#[derive(Debug, sqlx::FromRow)]
pub struct RecurringRuleRow {
    pub id: String,
    pub title: String,
    pub pattern: String,
    pub days_of_week: String,
    pub start_time: String,
    pub duration_minutes: i64,
    pub block_type: String,
    pub goal_id: Option<String>,
    pub is_active: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecurringRule {
    pub id: String,
    pub title: String,
    pub pattern: String,
    pub days_of_week: Vec<i64>,
    pub start_time: String,
    pub duration_minutes: i64,
    pub block_type: String,
    pub goal_id: Option<String>,
    pub is_active: bool,
    pub created_at: String,
}

impl From<RecurringRuleRow> for RecurringRule {
    fn from(row: RecurringRuleRow) -> Self {
        let days_of_week =
            serde_json::from_str::<Vec<i64>>(&row.days_of_week).unwrap_or_default();
        Self {
            id: row.id,
            title: row.title,
            pattern: row.pattern,
            days_of_week,
            start_time: row.start_time,
            duration_minutes: row.duration_minutes,
            block_type: row.block_type,
            goal_id: row.goal_id,
            is_active: row.is_active != 0,
            created_at: row.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateRecurringRuleInput {
    pub title: String,
    pub pattern: String,
    pub days_of_week: Vec<i64>,
    pub start_time: String,
    pub duration_minutes: i64,
    pub block_type: String,
    pub goal_id: Option<String>,
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
