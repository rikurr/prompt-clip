import * as DialogUi from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./styles.css";

type Props = {
  triggerButton: React.ReactNode;
  title: string;
  description: string;

  onClose: () => void;
  form: React.ReactNode;
};

export const Dialog = ({
  triggerButton,
  title,
  description,
  onClose,
  form,
}: Props) => {
  return (
    <DialogUi.Root>
      <DialogUi.Trigger asChild>{triggerButton}</DialogUi.Trigger>
      <DialogUi.Portal>
        <DialogUi.Overlay className="DialogOverlay" />
        <DialogUi.Content className="DialogContent">
          <DialogUi.Title className="DialogTitle">{title}</DialogUi.Title>
          <DialogUi.Description className="DialogDescription">
            {description}
          </DialogUi.Description>
          {form}
          {/* <fieldset className="Fieldset">
            <label className="Label" htmlFor="name">
              Name
            </label>
            <input className="Input" id="name" defaultValue="Pedro Duarte" />
          </fieldset>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="username">
              Username
            </label>
            <input className="Input" id="username" defaultValue="@peduarte" />
          </fieldset> */}
          <DialogUi.Close asChild>
            <button className="IconButton" aria-label="Close" onClick={onClose}>
              <Cross2Icon />
            </button>
          </DialogUi.Close>
        </DialogUi.Content>
      </DialogUi.Portal>
    </DialogUi.Root>
  );
};
