import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PhotoAlbum, { Photo } from "react-photo-album";
import GalleryImage from "./GalleryImage";
import * as prisma from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Gallery = () => {
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
    user: {
      email: string;
    };
  }
  const { data: session, status } = useSession();

  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [imageData, setImageData] = useState<ImageDataResponse | null>(null);
  const [filter, setFilter] = useState<{
    search: string | undefined;
    begin: Date | undefined;
    end: Date | undefined;
    user: boolean | undefined;
  }>();
  const [transitionDirection, setTransitionDirection] = useState<
    "left" | "right" | null
  >(null);
  const [imageChange, setImageChange] = useState<{
    field: string;
    value: string;
  } | null>();

  const imageEditBox = useRef<HTMLInputElement>(null);

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

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const displaySearchImages = async (
    search?: string,
    begin?: Date,
    end?: Date,
    user?: boolean,
  ) => {
    if (timeoutId != null) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(async () => {
      const beginISO = begin
        ? `begin=${encodeURIComponent(begin.toISOString())}`
        : undefined;
      const endISO = end
        ? `end=${encodeURIComponent(end.toISOString())}`
        : undefined;
      const encodedSearch = search
        ? `search=${encodeURIComponent(search)}`
        : undefined;
      const encodedUser = user ? `user=${encodeURIComponent(user)}` : undefined;

      let url = "/api/images/urls?";
      const params = [encodedSearch, beginISO, endISO, encodedUser].filter(
        Boolean,
      );
      url += params.join("&");

      const data = await fetch(url).then((res) => res.json());
      const res = await urlsToPhotos(data.urls);
      setPhotos(res);
      setTimeoutId(null);
    }, 200);
    setTimeoutId(id);
  };

  useEffect(() => {
    displaySearchImages(
      filter?.search,
      filter?.begin,
      filter?.end,
      filter?.user,
    );
  }, [filter]);

  useEffect(() => {
    imageEditBox.current?.focus();
  }, [imageChange]);

  const deleteImage = async (name: string) => {
    const response = await fetch(`/api/images/${name}`, {
      method: "DELETE",
    });
    if (response.status != 204) return;
    let photoCopy = [...photos];
    const idx = photoCopy.findIndex((e) => e.src.includes(name));
    photoCopy.splice(idx, 1);
    setPhotos(photoCopy);
    (document.getElementById("image_info_modal")! as any).close();
  };

  const handleImageChange = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      let obj: any = {};
      obj[imageChange?.field!] = imageChange?.value;
      updateImage(obj);
    }
  };

  const updateImage = async (obj: object) => {
    const res = await fetch(`${photos[focusedIndex!].src}`, {
      body: JSON.stringify(obj),
      method: "PATCH",
    }).then((res) => res.json());
    setImageData(res);
    setImageChange(null);
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
    let modal = document.getElementById("image_info_modal")! as any;
    modal.scrollTop = 0;
    modal.showModal();
    router.push("#slide");
    setImageChange(null);
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
    setImageChange(null);
    router.push("#slide");
  };

  const setFilterValue = async (object: any) => {
    for (const key of Object.keys(object)) {
      setFilter({ ...filter, [key]: object[key] } as any);
    }
  };

  return (
    <>
      <div className="text-center space-y-3">
        <h1 className="text-5xl text-white font-bold">Gallery</h1>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex justify-center mt-5">
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow border-none focus:outline-none focus:ring-0"
              placeholder="Search..."
              onChange={(event) =>
                setFilterValue({ search: event.target.value })
              }
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </div>
        <div className="flex mt-4">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">From:</span>
            </div>
            <input
              type="date"
              name="beginTime"
              placeholder="Timestart"
              className="input input-secondary input-bordered w-full max-w-xs h-12 mr-3"
              onChange={(event) =>
                setFilterValue({
                  begin: event.target.value
                    ? new Date(event.target.value)
                    : undefined,
                })
              }
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">To:</span>
            </div>

            <input
              type="date"
              name="endTime"
              placeholder="Timestart"
              className="input input-secondary input-bordered w-full max-w-xs h-12 ml-3"
              onChange={(event) =>
                setFilterValue({
                  end: event.target.value
                    ? new Date(event.target.value)
                    : undefined,
                })
              }
            />
          </label>
        </div>
        <div className="flex form-control mt-5">
          <label className="label cursor-pointer">
            <span className="label-text mr-5">My Pictures</span>
            <input
              checked={filter?.user}
              type="checkbox"
              name="user"
              className="checkbox checkbox-primary"
              onChange={() =>
                setFilterValue({
                  user: !filter?.user,
                })
              }
            />
          </label>
        </div>
      </div>
      <div className="w-screen flex justify-center">
        <div className="w-4/5 h-full mt-10 items-center">
          <PhotoAlbum
            layout="masonry"
            onClick={({ index }) => openImageModal(index)}
            photos={photos}
            renderPhoto={GalleryImage}
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
                          onClick={() =>
                            window.open(photos[focusedIndex].src, "_blank")
                          }
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
                        <div
                          id="modal-image-slide-buttons"
                          className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
                        >
                          <a
                            onClick={() => {
                              setTransitionDirection("left");
                              slideTo(
                                (focusedIndex - 1 + photos.length) %
                                  photos.length,
                              );
                            }}
                            className="btn btn-circle btn-ghost text-2xl transform transition-transform duration-200 hover:scale-110"
                          >
                            ❮
                          </a>
                          <a
                            onClick={() => {
                              setTransitionDirection("right");
                              slideTo((focusedIndex + 1) % photos.length);
                            }}
                            className="btn btn-circle btn-ghost text-2xl transform transition-transform duration-200 hover:scale-110"
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
                    <h2
                      className="font-bold text-2xl mb-2 text-sky-200"
                      onClick={() => {
                        setImageChange({
                          field: "name",
                          value: imageChange?.value
                            ? imageChange.value
                            : imageData?.name!,
                        });
                      }}
                    >
                      {imageChange?.field != "name" ? (
                        imageData?.name
                      ) : (
                        <input
                          ref={imageEditBox}
                          type="text"
                          placeholder={imageData?.name}
                          className="input input-bordered w-full max-w-xs h-12"
                          value={imageChange?.value}
                          onKeyDown={handleImageChange}
                          onBlur={() => setImageChange(null)}
                          onChange={(event) =>
                            setImageChange({
                              field: "name",
                              value: event.target.value,
                            })
                          }
                        />
                      )}
                    </h2>
                    <p className="mb-2">
                      Created:{" "}
                      <span
                        className="font-semibold text-blue-300"
                        onBlur={() => setImageChange(null)}
                        onClick={() => {
                          setImageChange({
                            field: "created",
                            value: imageData?.created! as any,
                          });
                        }}
                      >
                        {imageChange?.field == "created" ? (
                          <input
                            ref={imageEditBox}
                            type="date"
                            placeholder={imageData?.created! as any}
                            className="input input-bordered w-full max-w-xs h-12"
                            value={
                              new Date(imageChange?.value)
                                .toISOString()
                                .split("T")[0]
                            }
                            onChange={(event) => {
                              updateImage({
                                created: new Date(event.target.value),
                              });
                            }}
                          />
                        ) : imageData?.created ? (
                          new Intl.DateTimeFormat("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                          }).format(new Date(imageData?.created))
                        ) : (
                          ""
                        )}
                      </span>
                    </p>
                    <p className="mb-2">
                      Description:{" "}
                      <span
                        className="font-semibold text-blue-300"
                        onBlur={() => setImageChange(null)}
                        onClick={() => {
                          setImageChange({
                            field: "description",
                            value: imageData?.description! as any,
                          });
                        }}
                      >
                        {imageChange?.field != "description" ? (
                          imageData?.description || "None"
                        ) : (
                          <input
                            ref={imageEditBox}
                            type="text"
                            placeholder={imageData?.description!}
                            className="input input-bordered w-full max-w-xs h-12"
                            value={imageChange?.value}
                            onKeyDown={handleImageChange}
                            onBlur={() => setImageChange(null)}
                            onChange={(event) =>
                              setImageChange({
                                field: "description",
                                value: event.target.value,
                              })
                            }
                          />
                        )}
                      </span>
                    </p>

                    <p className="mb-2">
                      Group Name:{" "}
                      <span
                        className="font-semibold text-blue-300"
                        onBlur={() => setImageChange(null)}
                        onClick={() => {
                          setImageChange({
                            field: "groupname",
                            value: imageData?.group.name! as any,
                          });
                        }}
                      >
                        {imageChange?.field != "groupname" ? (
                          imageData?.group.name
                        ) : (
                          <input
                            ref={imageEditBox}
                            type="text"
                            placeholder={imageData?.group.name}
                            className="input input-bordered w-full max-w-xs h-12"
                            value={imageChange?.value}
                            onKeyDown={handleImageChange}
                            onBlur={() => setImageChange(null)}
                            onChange={(event) =>
                              setImageChange({
                                field: "groupname",
                                value: event.target.value,
                              })
                            }
                          />
                        )}
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
                        }).format(
                          new Date(
                            imageData?.group.start || (0 as any),
                          ).getTime(),
                        )}
                        -
                        {new Intl.DateTimeFormat("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        }).format(
                          new Date(
                            imageData?.group.end || (0 as any),
                          ).getTime(),
                        )}
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
                <button
                  className="btn bg-red-600"
                  disabled={imageData?.user.email != session?.user?.email}
                  onClick={() => deleteImage(imageData?.gcStorageName!)}
                >
                  Delete
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </>
  );
};
export default Gallery;
