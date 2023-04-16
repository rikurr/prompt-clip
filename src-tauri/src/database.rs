use futures::TryStreamExt;
use serde::{Deserialize, Serialize};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    Row, Sqlite, SqlitePool, Transaction,
};
use std::str::FromStr;

// モジュール内の関数の戻り値型を定義する
type DbResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

// SQLiteのコネクションプールを作成して返す
pub(crate) async fn create_sqlite_pool(database_url: &str) -> DbResult<SqlitePool> {
    // データベースの設定を行う
    let connection_options = SqliteConnectOptions::from_str(database_url)?
        // データベースが存在しない場合は作成する
        .create_if_missing(true)
        // トランザクション使用時の性能を向上させるためにWalモードを使用する
        .journal_mode(SqliteJournalMode::Wal)
        // トランザクション使用時の性能を向上させるためにNormalモードを使用する
        .synchronous(SqliteSynchronous::Normal);

    // コネクションプールを作成する
    let sqlite_pool = SqlitePoolOptions::new()
        // コネクションプールの最大数を設定する
        .max_connections(5)
        .connect_with(connection_options)
        .await?;

    Ok(sqlite_pool)
}

// DBのマイグレーションを行う
pub(crate) async fn run_migrations(sqlite_pool: &SqlitePool) -> DbResult<()> {
    // マイグレーションを行う
    sqlx::migrate!("./db").run(sqlite_pool).await?;

    Ok(())
}

// プロンプト構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct Prompt {
    pub id: String,
    pub name: String,
    pub content: String,
    pub created_at: i64,
}

// タグ構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
}

// プロンプトとタグの関連付け構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct PromptTag {
    pub prompt_id: String,
    pub tag_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PromptWithTags {
    id: String,
    name: String,
    content: String,
    tags: Vec<Tag>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptRequest {
    id: String,
    name: String,
    content: String,
    tags: Vec<TagRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagRequest {
    id: String,
    name: String,
}

// プロンプトの取得
pub(crate) async fn get_prompt(sqlite_pool: &SqlitePool) -> DbResult<Vec<Prompt>> {
    // プロンプトを取得するSQL
    let sql = r#"
        SELECT
            id,
            name,
            content,
            created_at
        FROM
            prompt
        ORDER BY
            id
    "#;

    // プロンプトを取得する
    let mut prompts = Vec::new();
    let mut rows = sqlx::query(sql).fetch(sqlite_pool);
    while let Some(row) = rows.try_next().await? {
        let prompt = Prompt {
            id: row.get("id"),
            name: row.get("name"),
            content: row.get("content"),
            created_at: row.get("created_at"),
        };
        prompts.push(prompt);
    }

    Ok(prompts)
}

// プロンプトとタグの関連付けを取得
pub(crate) async fn get_prompt_tag(sqlite_pool: &SqlitePool) -> DbResult<Vec<PromptTag>> {
    // プロンプトとタグの関連付けを取得するSQL
    let sql = r#"
        SELECT
            prompt_id,
            tag_id
        FROM
            prompt_tag
        ORDER BY
            prompt_id
    "#;

    // プロンプトとタグの関連付けを取得する
    let mut prompt_tags = Vec::new();
    let mut rows = sqlx::query(sql).fetch(sqlite_pool);
    while let Some(row) = rows.try_next().await? {
        let prompt_tag = PromptTag {
            prompt_id: row.get("prompt_id"),
            tag_id: row.get("tag_id"),
        };
        prompt_tags.push(prompt_tag);
    }

    Ok(prompt_tags)
}

// プロンプトの取得と関連したタグも取得する
pub async fn get_prompt_with_tag(sqlite_pool: &SqlitePool) -> DbResult<Vec<PromptWithTags>> {
    let prompts = get_prompt(sqlite_pool).await?;
    let prompt_tags = get_prompt_tag(sqlite_pool).await?;

    let mut prompt_with_tags = Vec::new();
    for prompt in prompts {
        let mut tags = Vec::new();
        for prompt_tag in &prompt_tags {
            if prompt.id == prompt_tag.prompt_id {
                let tag = Tag {
                    id: prompt_tag.tag_id.clone(),
                    name: "".to_string(),
                };
                tags.push(tag);
            }
        }
        let prompt_with_tag = PromptWithTags {
            id: prompt.id,
            name: prompt.name,
            content: prompt.content,
            tags,
            created_at: prompt.created_at,
        };
        prompt_with_tags.push(prompt_with_tag);
    }

    Ok(prompt_with_tags)
}

// プロンプトとタグの作成
pub(crate) async fn insert_prompt(
    sqlite_pool: &SqlitePool,
    prompt_request: PromptRequest,
) -> DbResult<()> {
    // トランザクションを開始する
    let mut transaction = sqlite_pool.begin().await?;

    // プロンプトのクエリ
    let sql = r#"
        INSERT INTO prompt (
            id,
            name,
            content,
        ) VALUES (
            ?,
            ?,
            ?,
            ?
        )
    "#;

    // プロンプトの登録
    sqlx::query(sql)
        .bind(&prompt_request.id)
        .bind(&prompt_request.name)
        .bind(&prompt_request.content)
        .execute(&mut transaction)
        .await?;

    // プロンプトとタグの関連付けの登録
    update_tags_and_associations(&mut transaction, &prompt_request.id, &prompt_request.tags)
        .await?;

    // トランザクションをコミットする
    transaction.commit().await?;

    Ok(())
}

// // 新しいプロンプトとタグの関連付けを作成する関数です。
// pub(crate) async fn insert_prompt_tag(
//     sqlite_pool: &SqlitePool,
//     prompt_request: PromptRequest,
// ) -> DbResult<()> {
//     // プロンプトとタグの関連付けの登録SQL
//     let sql = r#"
//         INSERT INTO prompt_tag (
//             prompt_id,
//             tag_id
//         ) VALUES (
//             ?,
//             ?
//         )
//     "#;

//     // プロンプトとタグの関連付けの登録
//     for tag in &prompt_request.tags {
//         sqlx::query(sql)
//             .bind(prompt_request.id)
//             .bind(tag.id)
//             .execute(sqlite_pool)
//             .await?;
//     }

//     Ok(())
// }

// タグの追加/更新と関連付けの更新を行う関数です。
// 各タグについて、get_or_create_tag 関数を呼び出してタグIDを取得し、associate_tag_with_prompt 関数を呼び出してプロンプトとタグの関連付けを更新します。
async fn update_tags_and_associations(
    tx: &mut Transaction<'_, Sqlite>,
    prompt_id: &str,
    tags: &Vec<TagRequest>,
) -> DbResult<()> {
    for tag in tags {
        let tag_id = get_or_create_tag(&mut *tx, tag).await?;
        associate_tag_with_prompt(&mut *tx, prompt_id, &tag_id).await?;
    }

    Ok(())
}

// タグの追加/更新を行う関数です。
async fn get_or_create_tag(tx: &mut Transaction<'_, Sqlite>, tag: &TagRequest) -> DbResult<String> {
    let select = "SELECT id FROM tags WHERE name = ?";

    // タグが存在するか確認する
    let rows = sqlx::query(select)
        .bind(&tag.name)
        .fetch_optional(&mut *tx)
        .await?;
    let tag_id = rows.map(|row| row.get("id"));

    match tag_id {
        // タグが存在する場合はそのIDを返す
        Some(id) => Ok(id),
        // タグが存在しない場合は新規作成する
        None => {
            sqlx::query("INSERT INTO tags (id, name) VALUES (?, ?)")
                .bind(&tag.id)
                .bind(&tag.name)
                .execute(&mut *tx)
                .await?;

            // let new_tag_id = sqlx::query("SELECT last_insert_rowid() as id")
            //     .fetch_one(&mut *tx)
            //     .await?
            //     .get("id");

            // フロント側で作成したIDを返す
            Ok(tag.id.clone())
        }
    }
}

// プロンプトとタグの関連付けを追加する関数です。
async fn associate_tag_with_prompt(
    tx: &mut Transaction<'_, Sqlite>,
    prompt_id: &str,
    tag_id: &str,
) -> DbResult<()> {
    let sql = r#"
      INSERT INTO prompts_tags (prompt_id, tag_id)
      VALUES (?, ?)
      ON CONFLICT (prompt_id, tag_id) DO NOTHING
    "#;

    sqlx::query(sql)
        .bind(prompt_id)
        .bind(tag_id)
        .execute(&mut *tx)
        .await?;

    Ok(())
}