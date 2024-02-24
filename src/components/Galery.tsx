import React, {useEffect, useState} from "react"
import PhotoAlbum, { Photo } from "react-photo-album"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const Galery = () => {

    const [currentPage, setCurrentPage] = useState(0)

    const [photos, setPhotos] = useState<Photo[]>([])

    useEffect(() => {
        const fetchImages = async () => {
            const data = await fetch(`/api/images/urls/page/${currentPage}`).then(res => res.json())
            let res = await urlsToPhotos(data.urls)
            setPhotos(res);
        };
        fetchImages();
    }, []);

    useEffect(() => {
        console.log(photos);
    }, [photos]);


    interface ImageUrlsResponse {
        url: string
        height: number,
        width: number
    }

    const urlsToPhotos = async (urls: ImageUrlsResponse[]): Promise<Photo[]> => {
        return urls.map((image: ImageUrlsResponse) => {
            return {
                src: image.url,
                width: image.width,
                height: image.height
            } as Photo
        })
    }

    return (
        <div className="w-4/5 h-full ml-10 mt-10 items-center">
            <PhotoAlbum layout="masonry" photos={photos} defaultContainerWidth={1200} sizes={{ size: "calc(100vw - 240px)" }} />
        </div>
    )
}
export default Galery