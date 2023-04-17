import * as Tooltip from "@radix-ui/react-tooltip";
import { ClipboardCopyIcon } from "@radix-ui/react-icons";
import * as Toast from "@radix-ui/react-toast";
import { writeText } from "@tauri-apps/api/clipboard";
import { useCallback, useState } from "react";
import "./styles.css";

type Props = {
  copyText: string;
};

export const CopyToClipboard = ({ copyText }: Props) => {
  const [open, setOpen] = useState(false);

  const handleCopy = useCallback(async () => {
    setOpen(true);
    await writeText(copyText);
  }, [copyText]);

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Toast.Provider swipeDirection="right">
            <button type="button" onClick={handleCopy}>
              <ClipboardCopyIcon />
            </button>
            <Toast.Root
              className="ToastRoot"
              open={open}
              onOpenChange={setOpen}
            >
              <Toast.Title className="ToastTitle">
                クリップボードにコピーしました
              </Toast.Title>
            </Toast.Root>
            <Toast.Viewport className="ToastViewport" />
          </Toast.Provider>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="TooltipContent" sideOffset={1}>
            クリップボードにコピーする
            <Tooltip.Arrow className="TooltipArrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
