import { useRef } from "react";
import JoditEditor from "jodit-react";
import { useJodit } from "../context/JoditContext";

export default function JoditInput({
    value,
    onChange,
    height = 350
}) {

    const editor = useRef(null);
    const { config } = useJodit();

    return (
        <JoditEditor
            ref={editor}
            value={value}
            config={{
                ...config,
                height
            }}
            onBlur={onChange}
        />
    );
}