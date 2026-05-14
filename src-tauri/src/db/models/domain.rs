use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Domain {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub icon: String,
    pub color: String,
    pub vision: String,
    pub purpose: String,
    pub current_status: String,
    pub health_score: f64,
    pub is_active: bool,
    pub sort_order: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDomainInput {
    pub id: String,
    pub vision: Option<String>,
    pub purpose: Option<String>,
    pub current_status: Option<String>,
    pub sort_order: Option<i64>,
}
