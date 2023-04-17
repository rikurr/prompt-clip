import * as AlertDialogUi from "@radix-ui/react-alert-dialog";
import "./styles.css";

type Props = {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  onAction: () => Promise<void>;
};

export const AlertDialog = ({
  triggerButton,
  title,
  description,
  onAction,
}: Props) => (
  <AlertDialogUi.Root>
    <AlertDialogUi.Trigger asChild>{triggerButton}</AlertDialogUi.Trigger>
    <AlertDialogUi.Portal>
      <AlertDialogUi.Overlay className="AlertDialogOverlay" />
      <AlertDialogUi.Content className="AlertDialogContent">
        <AlertDialogUi.Title className="AlertDialogTitle">
          {title}
        </AlertDialogUi.Title>
        <AlertDialogUi.Description className="AlertDialogDescription">
          {description}
        </AlertDialogUi.Description>
        <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
          <AlertDialogUi.Cancel asChild>
            <button className="Button mauve">キャンセル</button>
          </AlertDialogUi.Cancel>
          <AlertDialogUi.Action asChild>
            <button className="Button red" onClick={onAction}>
              実行する
            </button>
          </AlertDialogUi.Action>
        </div>
      </AlertDialogUi.Content>
    </AlertDialogUi.Portal>
  </AlertDialogUi.Root>
);
