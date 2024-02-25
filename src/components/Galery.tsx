import React, { useEffect, useState } from "react";
import Image from "next/image";
import PhotoAlbum, { Photo } from "react-photo-album";
import GaleryImage from "./GaleryImage";
import * as prisma from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Galery = () => {
  interface ImageDataResponse extends prisma.Image {
    group: {
      id: number;
      name: string;
      description: string | null;
      start: Date | null;
      end: Date | null;
      location: string | null;
    };
    keywords: {
      id: number;
      keyWord: string;
      image_id: number;
    }[];
  }
  const [currentPage, setCurrentPage] = useState(0);

  const [photos, setPhotos] = useState<Photo[]>([]);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [imageData, setImageData] = useState<ImageDataResponse | null>(null);
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

  const getPhotoData = async (src: string): Promise<ImageDataResponse> => {
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
    let imgData = new Promise((resolve, _) => {
      const data = getPhotoData(photos[index].src);
      setTimeout(async () => {
        setTransitionDirection(null);
        resolve(await data);
      }, 100);
    });

    setImageData((await imgData) as ImageDataResponse);
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
                <div className="bg-gray-800 text-white shadow-md rounded px-8 pt-6 pb-4 flex flex-col">
                  <h2 className="font-bold text-2xl mb-2 text-sky-200">
                    {imageData?.name}
                  </h2>
                  <p className="mb-2">
                    Created:{" "}
                    <span className="font-semibold text-blue-300">
                      {imageData?.created ? new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }).format(new Date(imageData?.created)) : ""}
                    </span>
                  </p>
                  <p className="mb-2">
                    Group Name:{" "}
                    <span className="font-semibold text-blue-300">
                      {imageData?.group.name}
                    </span>
                  </p>
                  <p className="mb-2">
                    Group Description:{" "}
                    <span className="font-semibold text-blue-300">
                      {imageData?.group.description}
                    </span>
                  </p>
                  <p className="mb-2">
                    Time Range:{" "}
                    <span className="font-semibold text-blue-300">
                      {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }).format(imageData?.group.start)}
                      -
                      {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }).format(imageData?.group.end)}
                    </span>
                  </p>
                  <p className="mb-2">
                    Location:{" "}
                    <span className="font-semibold text-blue-300">
                      {imageData?.group.location}
                    </span>
                  </p>
                </div>
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
