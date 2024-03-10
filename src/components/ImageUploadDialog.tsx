import React, { useState, useEffect } from "react";

export default function ImageUploadDialog() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState<string | null>(null);
  const [focusedKeyWord, setFocusedKeyword] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  const handleFormChange = (event: any) => {
    const target = event.target;

    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFormData({
      [name]: value,
    } as any);
  };

  const handleKeywordsChange = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      if (focusedKeyWord.trim().length == 0) {
        upload();
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

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImages(
      Array.from(
        new Set([...Array.from(event.target.files as any), ...images])
      ) as File[]
    );
  };

  const deleteFile = (index: number) => {
    let copy = [...images];
    copy.splice(index, 1);
    setImages(copy);
  };

  const deleteKeyword = (index: number) => {
    let copy = [...keywords];
    copy.splice(index, 1);
    setKeywords(copy);
  };

  const upload = async () => {
    let uploadFormData = new FormData();
    images.forEach((image) => uploadFormData.append("images", image));
    uploadFormData.append("groupName", formData.groupName);
    uploadFormData.append("description", formData.description);
    if (formData.startTime) uploadFormData.append("start", formData.startTime);
    if (formData.endTime) uploadFormData.append("end", formData.endTime);
    keywords.forEach((keyword) => uploadFormData.append("keywords", keyword));
    const response = await fetch("/api/images/upload", {
      body: uploadFormData,
      method: "POST",
    });
    if (response.status == 204) {
      setFormData({
        groupName: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
      });
      setImages([]);
      setKeywords([]);
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
      <h1 className="text-center text-4xl font-bold mb-4">Upload Images</h1>
      <div className="flex flex-col md:flex-row justify-between items-begin">
        <form
          className="grid grid-cols-1 grid-rows-1 gap-4 md:mr-5"
          onSubmit={upload}
        >
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
            onChange={(event) => addFiles(event)}
            multiple
          />
          <input
            type="text"
            name="groupName"
            placeholder="Group name..."
            className="input input-bordered w-full max-w-xs h-12"
            value={formData.groupName}
            onChange={handleFormChange}
          />
          <input
            type="date"
            name="beginTime"
            placeholder="Timestart"
            className="input input-secondary input-bordered w-full max-w-xs h-12"
            value={formData.startTime}
            onChange={handleFormChange}
          />
          <input
            type="date"
            name="endTime"
            placeholder="Timeend"
            className="input input-secondary input-bordered w-full max-w-xs h-12"
            value={formData.endTime}
            onChange={handleFormChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="input input-secondary input-bordered w-full max-w-xs h-12"
            value={formData.location}
            onChange={handleFormChange}
          />
          <textarea
            className="textarea textarea-secondary h-24 w-80"
            placeholder="Description..."
            name="description"
            value={formData.description}
            onChange={handleFormChange}
          ></textarea>
          <input
            type="text"
            className="input input-bordered input-secondary h-12"
            placeholder="Keywords.."
            value={focusedKeyWord}
            onChange={(event) => setFocusedKeyword(event.target.value)}
            onKeyDown={handleKeywordsChange}
          ></input>
        </form>

        <div className="md:ml-5 md:mt-12">
          <div className="relative top-0">
            <div className="p-4 absolute top-0 left-0 bg-secondary text-black px-2 py-1 rounded-br-md">
              Images
            </div>
            <div className="p-4 rounded-md border overflow-auto h-48 w-80 align-baseline border-secondary mt-4">
              <div className="mt-5">
                {images.map((image, i) => (
                  <div key={i} className="mb-4">
                    <div className="badge badge-primary badge-outline h-16 w-full transform hover:scale-110 cursor-pointer">
                      <svg
                        onClick={() => deleteFile(i)}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-6 h-6 stroke-current hover:opacity-80"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      <p className="p-4 font-mono truncate">{image.name}</p>
                      <img
                        className="min-w-20 max-w-32 h-4/5 object-cover mt-2 mb-2 mr-1 ml-1 rounded"
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="p-4 absolute top-0 left-0 bg-secondary text-black px-2 py-1 rounded-br-md">
              Keywords
            </div>
            <div className="p-4 rounded-md border overflow-auto min-h-16 md:min-h-32 max-h-52 w-80 align-baseline border-secondary mt-4">
              <div className="mt-5">
                {keywords.map((keyword, i) => (
                  <div key={i} className="badge badge-primary badge-outline transform hover:scale-110 mr-1">
                    <svg
                      onClick={() => deleteKeyword(i)}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-4 h-4 stroke-current hover:opacity-80"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    <p className="p-4 font-mono">#{keyword}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        role="alert"
        className={`absolute top-10 right-3 w-1/3 alert alert-error transition-all duration-500 mt-4 ${
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
      <div className="relative flex flex-col items-center justify-center">
        <button
          onClick={() => upload()}
          onTouchEnd={() => upload()}
          className="btn btn-outline btn-primary md:w-1/5 w-full mt-5"
        >
          Upload All
        </button>
      </div>
    </>
  );
}
