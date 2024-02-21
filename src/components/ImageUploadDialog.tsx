import React, {
  ChangeEvent,
  ChangeEventHandler,
  useState,
  useEffect,
} from "react";

export default function ImageUploadDialog() {
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<String[]>([]);
  const [showAlert, setShowAlert] = useState<String | null>(null);
  const [focusedKeyWord, setFocusedKeyword] = useState("");

  const handleKeywordsChange = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      if (focusedKeyWord.trim().length == 0) {
        setFocusedKeyword("");
        setShowAlert("Keyword cannot be empty");
        return;
      }

      if (keywords.indexOf(focusedKeyWord.trim()) != -1) {
        setShowAlert("Keyword already exists");
        return;
      }
      event.preventDefault();
      setKeywords([focusedKeyWord.trim(), ...keywords]);
      setFocusedKeyword("");
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 items-end">
        <form className="grid grid-cols-1 grid-rows-1 gap-4">
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
            multiple
          />
          <input
            type="text"
            placeholder="Group name..."
            className="input input-bordered w-full max-w-xs"
          />
          <textarea
            className="textarea textarea-secondary h-20"
            placeholder="Description..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          ></textarea>
          <input
            type="text"
            className="input input-bordered input-secondary h-20"
            placeholder="Keywords.."
            value={focusedKeyWord}
            onChange={(event) => setFocusedKeyword(event.target.value)}
            onKeyDown={handleKeywordsChange}
          ></input>
        </form>
        <div className="relative">
          <div className="p-4 absolute top-0 left-0 bg-secondary text-black px-2 py-1 rounded-br-md">
            Keywords
          </div>
          <div className="p-4 rounded-md border overflow-auto h-20 w-80 align-baseline border-secondary mt-4">
            {keywords.map((keyword, _) => (
              <div className="badge badge-primary badge-outline">
                #{keyword}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        role="alert"
        className={`absolute top-10 right-0 w-1/3 alert alert-error transition-all duration-500 mt-4 ${
          showAlert ? "" : "opacity-0"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{showAlert}</span>
      </div>
    </>
  );
}
