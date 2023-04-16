import { ChangeEvent, useCallback, useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { invoke } from "@tauri-apps/api/tauri";
import { TagLabel } from "./components/TagLabel";
import { v4 as uuidv4 } from "uuid";

type PromptManager = {
  prompts: Prompt[];
  tags: Tag[];
};

type Prompt = {
  id: string;
  name: string;
  content: string;
  tags: Tag[];
};

export type Tag = {
  id: string;
  name: string;
};

function App() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tag, setTag] = useState("");
  const [promptManager, setPromptManager] = useState<PromptManager | null>(
    null,
  );

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [],
  );

  const handleTagChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value);
  }, []);

  const addTag = useCallback(() => {
    const newTag = {
      id: uuidv4(),
      name: tag,
    };
    setTags([...tags, newTag]);
    setTag("");
  }, [tag, tags]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!promptManager) {
        return;
      }

      const newTags = tags.map((tag) => {
        // 既存のタグかどうかを確認する
        const existTag = promptManager.tags.find((t) => t.name === tag.name);

        // 既存のタグならそのまま返す
        if (existTag) {
          return existTag;
        }

        // 新規タグなら新規に作成する
        return {
          id: tag.id,
          name: tag.name,
        };
      });

      console.log("submit");
      const newPrompt: Prompt = {
        id: uuidv4(),
        name,
        content,
        tags: newTags,
      };

      console.log(newPrompt);

      // IPCでCoreプロセスのsave_promptを呼ぶ
      await invoke("save_prompt", { prompt: newPrompt });
      // IPCでCoreプロセスのfetch_promptを呼ぶ
      const prompt = await invoke<PromptManager>("fetch_prompt", {})
        // 例外が発生したらその旨コンソールに表示する
        .catch((err) => {
          console.error(err);
          return null;
        });
      console.debug(prompt);
      setPromptManager(prompt);

      // フォームを初期化する
      setName("");
      setContent("");
      setTags([]);
    },
    [name, content, tags, promptManager],
  );

  useEffect(() => {
    (async () => {
      // IPCでCoreプロセスのfetch_promptを呼ぶ
      const prompt = await invoke<PromptManager>("fetch_prompt", {})
        // 例外が発生したらその旨コンソールに表示する
        .catch((err) => {
          console.error(err);
          return null;
        });
      console.debug(prompt);
      setPromptManager(prompt);
    })();
  }, []);

  return (
    <div className="container">
      <h1>Prompt Clip</h1>
      <ul className="PromptList">
        <li className="Prompt PromptHeader">
          <div className="PromptName">プロンプト名</div>
          <div className="PromptContent">プロンプト</div>
          <ul className="PromptTagList">
            <li className="PromptTag">タグ</li>
          </ul>
        </li>
        {promptManager?.prompts.map((prompt) => (
          <li key={prompt.id} className="Prompt">
            <div className="PromptName">{prompt.name}</div>
            <div className="PromptContent">{prompt.content}</div>
            <TagLabel tags={prompt.tags} />
          </li>
        ))}
      </ul>
      <Form.Root className="FormRoot" onSubmit={handleSubmit}>
        <Form.Field className="FormField" name="name">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Form.Label className="FormLabel">名前</Form.Label>
            <Form.Message className="FormMessage" match="valueMissing">
              プロンプト名を入力してください
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              className="Input"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
            />
          </Form.Control>
        </Form.Field>
        <Form.Field className="FormField" name="content">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Form.Label className="FormLabel">内容</Form.Label>
            <Form.Message className="FormMessage" match="valueMissing">
              プロンプトの内容を入力してください
            </Form.Message>
          </div>
          <Form.Control asChild>
            <textarea
              className="Textarea"
              required
              value={content}
              onChange={handleContentChange}
            />
          </Form.Control>
        </Form.Field>
        <div>
          <div className="FormTag">
            <Form.Field className="FormField" name="tags">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Form.Label className="FormLabel">タグ</Form.Label>
              </div>
              <Form.Control asChild>
                <input
                  className="Input"
                  value={tag}
                  onChange={handleTagChange}
                  type="text"
                />
              </Form.Control>
            </Form.Field>

            <button
              disabled={tag === ""}
              type="button"
              className="Button"
              onClick={addTag}
            >
              追加
            </button>
          </div>
          <TagLabel tags={tags} />
        </div>
        <Form.Submit asChild>
          <button className="Button">プロンプトを追加する</button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export default App;
