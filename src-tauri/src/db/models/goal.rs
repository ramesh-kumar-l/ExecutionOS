use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Goal {
    pub id: String,
    pub title: String,
    pub description: String,
    pub domain_id: String,
    pub target_date: Option<String>,
    pub status: String,
    pub priority: String,
    pub success_criteria: String,
    pub progress: f64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateGoalInput {
    pub title: String,
    pub description: Option<String>,
    pub domain_id: String,
    pub target_date: Option<String>,
    pub priority: String,
    pub success_criteria: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGoalInput {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub target_date: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub progress: Option<f64>,
    pub success_criteria: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct GoalFilter {
    pub domain_id: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Milestone {
    pub id: String,
    pub goal_id: String,
    pub title: String,
    pub target_date: Option<String>,
    pub completed_at: Option<String>,
    pub sort_order: i64,
}
