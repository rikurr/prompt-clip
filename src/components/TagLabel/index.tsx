import { Cross1Icon } from "@radix-ui/react-icons";
import { Tag } from "../../App";

type Props = {
  tags: Tag[];
};

export const TagLabel = ({ tags }: Props) => {
  console.log(tags);

  tags.forEach((tag) => {
    console.log("hey", tag);
  });
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
