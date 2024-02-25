import React, { useEffect, useState } from "react";
import Image from "next/image";
import PhotoAlbum, { Photo } from "react-photo-album";
import GaleryImage from "./GaleryImage";
import * as prisma from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Galery = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const [photos, setPhotos] = useState<Photo[]>([]);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [imageData, setImageData] = useState<prisma.Image | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right" | null
  >(null);

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
    setFocusedIndex(index);
    setImageData(await getPhotoData(photos[index].src));
    console.log(imageData);
    document.getElementById("image_info_modal")!.showModal();
  };

  const slideTo = async (index: number) => {
    let imgData = new Promise((resolve, reject) => {
      setTimeout(async () => {
        setTransitionDirection(null);
        const data = await getPhotoData(photos[index].src);
        resolve(data);
      }, 100);
    });

    setImageData((await imgData) as prisma.Image);
    setFocusedIndex(index);
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
          className="modal modal-bottom sm:modal-middle w-screen"
        >
          <div className="modal-box w-screen">
            <div className="card w-full h-full bg-base-100 shadow-xl">
              <figure>
                <div className="carousel w-full">
                  {focusedIndex != null ? (
                    <div
                      id="slide"
                      className="carousel-item relative w-full flex items-center justify-center"
                    >
                      <Image
                        objectFit="contain"
                        src={photos[focusedIndex]}
                        alt={imageData?.name!}
                        className={`transform transition-transform duration-200 ${
                          transitionDirection === "left"
                            ? "-translate-x-full opacity-0"
                            : ""
                        } ${
                          transitionDirection === "right"
                            ? "translate-x-full opacity-0"
                            : ""
                        }`}
                      />
                      <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                        <a
                          onClick={() => {
                            setTransitionDirection("left");
                            slideTo(
                              (focusedIndex - 1 + photos.length) % photos.length
                            );
                          }}
                          className="btn btn-circle btn-ghost sm:text-2xl md:text-md transform transition-transform duration-200 hover:scale-110"
                        >
                          ❮
                        </a>
                        <a
                          onClick={() => {
                            setTransitionDirection("right");
                            slideTo((focusedIndex + 1) % photos.length);
                          }}
                          className="btn btn-circle btn-ghost sm:text-2xl md:text-md transform transition-transform duration-200 hover:scale-110"
                        >
                          ❯
                        </a>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </figure>
              <div
                className={`card-body w-full transform transition-all duration-200 ${
                  transitionDirection ? "opacity-0" : ""
                }`}
              >
                <h2 className="card-title">{imageData?.name}</h2>
                <p>Created: {imageData?.created}</p>
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
