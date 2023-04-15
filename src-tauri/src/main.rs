// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Serialize, Deserialize)]
pub struct PromptManager {
    pub prompts: Vec<Prompt>,
}

// プロンプトの構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct Prompt {
    pub id: Option<i32>,
    pub name: String,
    pub content: String,
    pub tags: HashSet<String>,
}

// impl Prompt {
//     // データベースからプロンプトを取得
//     pub fn fetch_all(conn: &Connection) -> Result<Vec<Prompt>> {
//         // ここにデータベースからプロンプトを取得するコードを実装します。
//         todo!()
//     }

//     // 新しいプロンプトをデータベースに保存
//     pub fn save(&self, conn: &Connection) -> Result<()> {
//         // ここにデータベースに新しいプロンプトを保存するコードを実装します。
//         todo!()
//     }

//     // プロンプトをデータベースから削除
//     pub fn delete(&self, conn: &Connection) -> Result<()> {
//         // ここにデータベースからプロンプトを削除するコードを実装します。
//         todo!()
//     }

//     // プロンプトをデータベースで更新
//     pub fn update(&self, conn: &Connection) -> Result<()> {
//         // ここにデータベースでプロンプトを更新するコードを実装します。
//         todo!()
//     }

//     // タグをデータベースから取得
//     fn fetch_tags(conn: &Connection, prompt_id: i32) -> Result<HashSet<String>> {
//         // ここにデータベースからタグを取得するコードを実装します。
//         todo!()
//     }

//     // プロンプトにタグを関連付ける
//     fn associate_tags(conn: &Connection, prompt_id: i32, tags: &HashSet<String>) -> Result<()> {
//         // ここにプロンプトにタグを関連付けるコードを実装します。
//         todo!()
//     }
// }

// プロンプトの取得
#[tauri::command]
fn get_prompt() -> Result<PromptManager, String> {
    let mut init_prompt1 = Prompt {
        id: Some(1),
        name: "初期データ".to_string(),
        content: "初期データ".to_string(),
        tags: HashSet::new(),
    };

    init_prompt1.tags.insert("初期データタグ".to_string());

    let mut init_prompt2 = Prompt {
        id: Some(2),
        name: "初期データ2".to_string(),
        content: "初期データ2".to_string(),
        tags: HashSet::new(),
    };

    init_prompt2.tags.insert("初期データ2タグ".to_string());

    let prompt_manager = PromptManager {
        prompts: vec![init_prompt1, init_prompt2],
    };
    Ok(prompt_manager)
}

// プロンプトの保存
#[tauri::command]
fn save_prompt(prompt: Prompt) -> Result<(), String> {
    println!("save_prompt");
    println!("{:?}", prompt);
    dbg!(prompt);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_prompt, save_prompt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
