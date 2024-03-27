import { options } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Server } from "socket.io";

interface UploadMapEntry {
  progressCallback?: (progress: number) => void;
  depositedCallbackPromise?: (value: (progress: number) => void) => void;
  userEmail: string;
  io?: Server;
}
let uploads: Map<string, UploadMapEntry> = new Map();

export const registerUpload = (
  userEmail: string,
  cuid: string,
  progressCallback: (progress: number) => void,
): void => {
  let upload = uploads.get(cuid);
  if (upload == undefined) {
    uploads.set(cuid, { progressCallback, userEmail });
    return;
  }
  if (userEmail != upload.userEmail) return {} as any; // TODO: Make this an error or something here
  if (upload.depositedCallbackPromise) {
    upload.depositedCallbackPromise(progressCallback);
    upload.depositedCallbackPromise = undefined;
  }
  upload.progressCallback = progressCallback;
};

export const getUploadFunction = async (
  cuid: string,
  userEmail: string,
): Promise<(progress: number) => void> => {
  let upload = uploads.get(cuid);
  if (upload == undefined || !upload.progressCallback) {
    let wsSetup = new Promise((res, _) => {
      uploads.set(cuid, { userEmail, depositedCallbackPromise: res });
    });
    return (await wsSetup) as any;
  }
  return upload.progressCallback;
};

const e = 0.2;

const ioHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id! as string;
  const session = (await getServerSession(req, res, options)) as any;
  const email = session!.user?.email;
  const server = (res.socket as any).server;
  let upload = uploads.get(id);

  if (upload == undefined || upload.depositedCallbackPromise) {
    const io = new Server(server, {
      path: `/api/images/upload/progress/${id}`,
    });
    server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected");
      const cleanup = () => {
        console.log("Finished transmission");
        socket.emit("finish");
        setTimeout(() => {
          uploads.delete(id);
          server.io = undefined;
        }, 2000);
      };
      socket.on("disconnect", cleanup);
      const callback = (progress: number) => {
        socket.emit("progress", progress * 100); // NOTE: This should probably rather be a broadcast
        if (Math.abs(100 - progress * 100) <= e) {
          cleanup();
        }
      };
      registerUpload(email, id, callback);
      upload = uploads.get(id)!;
      upload.io = io;
    });
  } else {
    server.io = upload.io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
