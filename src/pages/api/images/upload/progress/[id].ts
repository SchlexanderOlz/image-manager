import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

let uploads: Map<
  string,
  {
    callbackPromise: ((progressCallback: (progress: number) => void) => void) | null;
    userEmail: string;
  }
> = new Map();


export const registerUpload = (
  userEmail: string,
  uploadHash: string
): Promise<(progress: number) => void> => {
  return new Promise((resolve, _) => {
    uploads.set( uploadHash, { callbackPromise: resolve, userEmail });
    console.log("Succesfully registered: " + uploadHash)
  });
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id! as string;
  const upload = uploads.get(id);
  const server = (res.socket as any).server

  console.log("Requesting Upload: " + upload)
  if (upload == undefined) {
    res.status(404)
    res.send("Upload does not exist")
    return
  }
  if (!server.io) {
    const io = new Server(server, { path: `/api/images/upload/progress/${id}`});

    console.log("Requestin Connection")
    io.on("connection", (socket) => {
      console.log("Client connected")
      let callback = (progress: number) => {
        console.log("Socket emitted")
        socket.emit("progress", progress * 100);
        if (progress == 100) {
          socket.emit("finish")
          io.close()
          uploads.delete(id)
        }
      };
      upload.callbackPromise!(callback)
      upload.callbackPromise = null
    });

    server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
