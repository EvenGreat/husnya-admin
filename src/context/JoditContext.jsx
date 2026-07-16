import { createContext, useContext, useMemo } from "react";

const JoditContext = createContext();

export const JoditProvider = ({ children }) => {

    const config = useMemo(() => ({
        readonly: false,
        toolbarAdaptive: false,
        height: 350,
        spellcheck: true,
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        showCharsCounter: true,
        showWordsCounter: true,
        showXPathInStatusbar: false,
        beautifyHTML: true,
        enter: "P",
        defaultMode: "1",
        uploader: {
            insertImageAsBase64URI: true,
        },

        buttons: [
            "source",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "ul",
            "ol",
            "|",
            "outdent",
            "indent",
            "|",
            "font",
            "fontsize",
            "brush",
            "paragraph",
            "|",
            "image",
            "table",
            "link",
            "video",
            "|",
            "align",
            "undo",
            "redo",
            "|",
            "hr",
            "eraser",
            "copyformat",
            "|",
            "fullsize",
            "print",
            "preview"
        ]
    }), []);

    return (
        <JoditContext.Provider value={{ config }}>
            {children}
        </JoditContext.Provider>
    );
};

export const useJodit = () => useContext(JoditContext);