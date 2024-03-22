import { useEffect, useState } from "react";
import io from "socket.io-client";

const UploadProgress = (args: {
  uploadHash: string | null;
  setUploadHash: (val: string | null) => any;
}) => {
  const [progress, setProgress] = useState<number | null>(null);
  const { uploadHash, setUploadHash } = args;

  useEffect(() => {
    if (!uploadHash) return;
    const url = `/api/images/upload/progress/${uploadHash}`;
    fetch(url).finally(() => {
      const socket = io({ path: url, forceNew: true });

      socket.on("progress", (data) => {
        setProgress(data as number);
        if (data == 100) socket.close();
      });

      socket.on("finish", () => {
        setUploadHash(null);
      });

      socket.on("disconnect", () => {
        setUploadHash(null);
      });
    });
  }, [uploadHash]);
  if (!uploadHash) return;
  return (
    <div className="flex flex-col items-center">
      <div
        className="radial-progress"
        style={{ "--value": progress } as any}
        role="progressbar"
      >
        {progress?.toFixed(1)}%
      </div>
      <progress
        className="progress progress-secondary w-56 mt-5"
        value={progress?.toFixed(1)}
        max="100"
      ></progress>
    </div>
  );
};

export default UploadProgress;
