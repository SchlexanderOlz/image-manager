import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const UploadProgress = (args: { socket: Socket | null }) => {
  const [progress, setProgress] = useState<number | null>(null);
  const { socket } = args;

  const e = 1e-2;

  useEffect(() => {
    if (!socket) return;
    socket.on("progress", (data: any) => {
      setProgress(data as number);
      if (Math.abs(100 - data) <= e) {
        socket.close();
      }
    });

    socket.on("finish", () => {
      socket.close();
    });

    socket.on("disconnect", () => {
      socket.close();
    });
  }, [socket]);
  if (!socket) return;
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-base-100 bg-opacity-40">
      <div
        className="radial-progress text-secondary"
        style={
          {
            "--value": progress,
            "--size": "12rem",
            "--thickness": "1rem",
          } as any
        }
        role="progressbar"
      >
        {progress?.toFixed(1)}%
      </div>
      <progress
        className="progress progress-secondary w-64 mt-5"
        value={progress?.toFixed(1)}
        max="100"
      ></progress>
    </div>
  );
};

export default UploadProgress;
