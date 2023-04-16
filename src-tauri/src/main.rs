// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::Prompt;
use tauri::{Manager, State};
pub(crate) mod database;

// プロンプトの取得
// #[tauri::command]
// fn get_prompt() -> Result<Vec<Prompt>, String> {
// let mut init_prompt1 = Prompt {
//     id: "1".to_string(),
//     name: "初期データ".to_string(),
//     content: "初期データ".to_string(),
//     tags: HashSet::new(),
// };

// init_prompt1.tags.insert("初期データタグ".to_string());

// let mut init_prompt2 = Prompt {
//     id: "2".to_string(),
//     name: "初期データ2".to_string(),
//     content: "初期データ2".to_string(),
//     tags: HashSet::new(),
// };

// init_prompt2.tags.insert("初期データ2タグ".to_string());

// let prompt_manager = PromptManager {
//     prompts: vec![init_prompt1, init_prompt2],
// };
// Ok(())
// }

// プロンプトの保存
#[tauri::command]
fn save_prompt(sqlite_pool: State<'_, sqlx::SqlitePool>, prompt: Prompt) -> Result<(), String> {
    println!("save_prompt");
    println!("{:?}", prompt);
    dbg!(prompt);
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    use tauri::async_runtime::block_on;

    // データベースのファイルパスの設定
    const DATABASE_DIR: &str = "prompt-clip-db";
    const DATABASE_FILE: &str = "db.sqlite";

    // ユーザのホームディレクトリ直下にデータベースのディレクトリを作成する
    let home_dir = directories::UserDirs::new()
        .map(|dirs| dirs.home_dir().to_path_buf())
        // ホームディレクトリが取得できないときはカレントディレクトリを使う
        .unwrap_or_else(|| std::env::current_dir().expect("Cannot access the current directory"));
    let database_dir = home_dir.join(DATABASE_DIR);
    let database_file = database_dir.join(DATABASE_FILE);

    // データベースファイルが存在するかチェックする
    let db_exists = std::fs::metadata(&database_file).is_ok();
    // 存在しないなら、ファイルを格納するためのディレクトリを作成する
    if !db_exists {
        std::fs::create_dir(&database_dir)?;
    }

    // データベースURLを作成する
    let database_dir_str = dunce::canonicalize(&database_dir)
        .unwrap()
        .to_string_lossy()
        .replace('\\', "/");
    let database_url = format!("sqlite://{}/{}", database_dir_str, DATABASE_FILE);

    // SQLiteのコネクションプールを作成する
    let sqlite_pool = block_on(database::create_sqlite_pool(&database_url))?;

    // データベースファイルがなければ、マイグレーションSQLを実行する
    if !db_exists {
        block_on(database::run_migrations(&sqlite_pool))?;
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_prompt])
        .setup(|app| {
            app.manage(sqlite_pool);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
