import { Cross1Icon } from "@radix-ui/react-icons";

type Props = {
  tags: string[];
};

export const TagLabel = ({ tags }: Props) => {
  return (
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
  );
};
