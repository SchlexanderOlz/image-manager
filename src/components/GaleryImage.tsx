import Image from "next/image";
import type { RenderPhotoProps } from "react-photo-album";

export default function GaleryImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
}: RenderPhotoProps) {
  const showImageProps = (event: any) => {};

  return (
    <>
      <div
        className="relative border-4 border-secondary rounded-md transform hover:scale-110 transition-transform duration-500 ease-in-out"
        style={{ ...wrapperStyle }}
      >
        <Image
          fill
          src={photo}
          placeholder={"blurDataURL" in photo ? "blur" : undefined}
          {...{ alt, title, sizes, onClick, className }}
          className="transition-transform duration-500 ease-in-out"
        />
      </div>

    </>
  );
}
