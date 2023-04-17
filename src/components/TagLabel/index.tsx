import { Cross1Icon } from "@radix-ui/react-icons";
import { Tag } from "../../App";
import "./styles.css";

type Props = {
  tags: Tag[];
};

export const TagLabel = ({ tags }: Props) => {
  return (
    <ul className="TagLabel">
      {tags.map((tag) => (
        <li key={tag.id} className="Tag">
          <span>{tag.name}</span>
          <button type="button" className="TagDeleteButton">
            <Cross1Icon />
          </button>
        </li>
      ))}
    </ul>
  );
};
