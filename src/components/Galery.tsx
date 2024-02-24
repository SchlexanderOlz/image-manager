import React, { useEffect, useState } from "react";
import PhotoAlbum, { Photo } from "react-photo-album";
import GaleryImage from "./GaleryImage";
import * as prisma from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Galery = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [imageData, setImageData] = useState<prisma.Image | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const data = await fetch(`/api/images/urls/page/${currentPage}`).then(
        (res) => res.json()
      );
      let res = await urlsToPhotos(data.urls);
      setPhotos(res);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    console.log(photos);
  }, [photos]);

  interface ImageUrlsResponse {
    url: string;
    height: number;
    width: number;
  }

  const urlsToPhotos = async (urls: ImageUrlsResponse[]): Promise<Photo[]> => {
    return urls.map((image: ImageUrlsResponse) => {
      return {
        src: image.url,
        width: image.width,
        height: image.height,
      } as Photo;
    });
  };

  const getPhotoData = async (src: string): Promise<prisma.Image> => {
    const data = await fetch(`${src}/data`).then((res) => res.json());
    console.log(data);
    return data;
  };

  const openImageModal = async (index: number) => {
    setImageData(await getPhotoData(photos[index].src));
    console.log(imageData);
    document.getElementById("image_info_modal").showModal();
  };

  return (
    <div className="w-screen flex justify-center">
      <div className="w-4/5 h-full mt-10 items-center">
        <PhotoAlbum
          layout="masonry"
          onClick={({ index }) => openImageModal(index)}
          photos={photos}
          renderPhoto={GaleryImage}
          defaultContainerWidth={1200}
          sizes={{ size: "calc(100vw - 240px)" }}
        />

        <dialog
          id="image_info_modal"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box">
            <div className="card w-full h-full bg-base-100 shadow-xl">
              <figure>
                <div className="w-64 carousel rounded-box">
                  <div className="carousel-item w-full">
                    <img
                      src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg"
                      className="w-full"
                      alt="Tailwind CSS Carousel component"
                    />
                  </div>
                  <div className="carousel-item w-full">
                    <img
                      src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg"
                      className="w-full"
                      alt="Tailwind CSS Carousel component"
                    />
                  </div>
                </div>
              </figure>
              <div className="card-body">
                <h2 className="card-title">{imageData?.name}</h2>
                <p>Created: {imageData?.created!}</p>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
};
export default Galery;
