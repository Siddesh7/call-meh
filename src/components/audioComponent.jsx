import {useEffect, useRef} from "react";
import {IoMdCall} from "react-icons/io";
import {ImPhoneHangUp} from "react-icons/im";
export default function AudioPlayer({
  stream,
  name,
  onMute,
  onEnd,
  isConnected,
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [audioRef, stream]);

  return (
    <div className="mockup-phone border-primary">
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1 flex flex-col justify-between py-[50px]">
          <div>
            <audio className="absolute" ref={audioRef} muted={false} autoPlay />
            <p className="text-bold text-4xl text-primary">{name}</p>
            {isConnected ? (
              <p className="text-bold text-xl text-secondary">ringing ...</p>
            ) : (
              <p>time</p>
            )}
          </div>

          <div className="flex gap-16">
            {" "}
            <button
              className="btn btn-outline btn-success btn-info rounded-full"
              onClick={onMute}
            >
              <IoMdCall size={30} />
            </button>
            <button
              className="btn btn-outline btn-error btn-info rounded-full"
              onClick={onEnd}
            >
              <ImPhoneHangUp size={30} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
