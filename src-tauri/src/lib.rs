mod commands;
mod db;
mod error;

use db::pool::create_pool;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");

            let db_path = app_data_dir.join("lensstack.db");

            tauri::async_runtime::block_on(async {
                let pool = create_pool(db_path)
                    .await
                    .expect("Failed to create database pool");

                // Run migrations
                run_migrations(&pool).await.expect("Failed to run migrations");

                app.manage(pool);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Domains
            commands::domains::get_domains,
            commands::domains::get_domain,
            commands::domains::update_domain,
            commands::domains::get_domain_health,
            // Goals
            commands::goals::get_goals,
            commands::goals::get_goal,
            commands::goals::create_goal,
            commands::goals::update_goal,
            commands::goals::delete_goal,
            commands::goals::get_milestones,
            commands::goals::create_milestone,
            commands::goals::complete_milestone,
            commands::goals::delete_milestone,
            // Execution
            commands::execution::get_time_blocks,
            commands::execution::create_time_block,
            commands::execution::complete_time_block,
            commands::execution::skip_time_block,
            commands::execution::get_active_focus_session,
            commands::execution::start_focus_session,
            commands::execution::end_focus_session,
            // Settings
            commands::settings::get_settings,
            commands::settings::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn run_migrations(pool: &sqlx::SqlitePool) -> Result<(), sqlx::Error> {
    let migration_001 = include_str!("db/migrations/001_initial.sql");
    let migration_002 = include_str!("db/migrations/002_seed_domains.sql");

    sqlx::query(migration_001).execute(pool).await?;
    sqlx::query(migration_002).execute(pool).await?;

    Ok(())
}
