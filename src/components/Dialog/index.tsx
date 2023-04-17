import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./styles.css";

type Props = {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  onAction: () => Promise<void>;
};

export const Dialog = ({
  triggerButton,
  title,
  description,
  onAction,
}: Props) => (
  <AlertDialog.Root>
    <AlertDialog.Trigger asChild>{triggerButton}</AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="AlertDialogOverlay" />
      <AlertDialog.Content className="AlertDialogContent">
        <AlertDialog.Title className="AlertDialogTitle">
          {title}
        </AlertDialog.Title>
        <AlertDialog.Description className="AlertDialogDescription">
          {description}
        </AlertDialog.Description>
        <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
          <AlertDialog.Cancel asChild>
            <button className="Button mauve">キャンセル</button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button className="Button red" onClick={onAction}>
              実行する
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
