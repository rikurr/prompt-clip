import { ChangeEvent, useCallback, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { invoke } from "@tauri-apps/api/tauri";
import { Cross1Icon } from "@radix-ui/react-icons";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [prompt, setPrompt] = useState([]);

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
    setTags([...tags, tag]);
    setTag("");
  }, [tag, tags]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container">
      <h1>Prompt Clip</h1>
      <Form.Root className="FormRoot">
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
          <ul className="TagLabel">
            {tags.map((tag, index) => (
              <li key={index} className="Tag">
                <span>{tag}</span>
                <button type="button" className="TagDeleteButton">
                  <Cross1Icon />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Form.Submit asChild>
          <button className="Button">プロンプトを追加する</button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
}

export default App;
