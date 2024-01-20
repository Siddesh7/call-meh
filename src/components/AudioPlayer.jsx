import {useEffect, useRef, useState} from "react";
import {IoMicOffOutline, IoMicSharp} from "react-icons/io5";
import {ImPhoneHangUp} from "react-icons/im";
import {reverseResolveAddress} from "../util";
const AudioPlayer = ({stream, onEnd, onMute, audioState, peerAddress}) => {
  const audioRef = useRef(null);
  const [callerName, setCallerName] = useState(null);
  const [timeSinceMount, setTimeSinceMount] = useState(0);

  useEffect(() => {
    const fetchCallerName = async () => {
      const name = await reverseResolveAddress(peerAddress);
      setCallerName(name);
    };

    fetchCallerName();
  }, [peerAddress]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.play();
    }

    const interval = setInterval(() => {
      setTimeSinceMount((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [audioRef, stream]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className=" border-primary w-full h-full">
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1 flex flex-col justify-between py-[50px]">
          <div>
            <p
              className={`text-bold text-primary ${
                callerName ? `text-3xl` : `text-xs`
              }`}
            >
              {callerName ?? peerAddress}
            </p>
            <p className="mt-[20px]">{formatTime(timeSinceMount)}</p>
          </div>
          <div className="flex gap-16">
            <button className="btn btn-outline btn-info" onClick={onMute}>
              {audioState ? (
                <IoMicOffOutline size={"20px"} />
              ) : (
                <IoMicSharp size={"20px"} />
              )}
            </button>
            <button className="btn btn-outline btn-error" onClick={onEnd}>
              <ImPhoneHangUp size={"20px"} />
            </button>
            <audio
              ref={audioRef}
              muted={false}
              autoPlay
              className="w-1/4 h-auto border-2 border-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
