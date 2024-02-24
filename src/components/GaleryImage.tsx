import Image from "next/image";
import type { RenderPhotoProps } from "react-photo-album";

export default function GaleryImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
}: RenderPhotoProps) {
  console.log("sosoosoa")
  return (
    <div className="relative border rounded-md" style={{ ...wrapperStyle }}>
      <Image
        fill
        src={photo}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
        {...{ alt, title, sizes, className, onClick }}
        className="rounded-full"
      />
    </div>
  );
}