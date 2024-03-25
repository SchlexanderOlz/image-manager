import React from "react";
import Image from "next/image";

// eslint-disable-next-line react/display-name
const PreviewImageBox = React.memo(({ images, onDelete }: any) => (
  <div className="mt-5">
    {images.map((image: any, i: number) => (
      <div key={i} className="mb-4">
        <div className="badge badge-primary badge-outline h-16 w-full transform hover:scale-110 cursor-pointer">
          <svg
            onClick={onDelete}
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
          <Image
            className="min-w-20 max-w-32 h-4/5 object-cover mt-2 mb-2 mr-1 ml-1 rounded"
            src={URL.createObjectURL(image)}
            alt={image.name}
          />
        </div>
      </div>
    ))}
  </div>
));

export default PreviewImageBox;
