import {IoMdCall} from "react-icons/io";
import {ImPhoneHangUp} from "react-icons/im";
import {reverseResolveAddress} from "../util";
import {useEffect, useState} from "react";
export default function IncomingCall({callerID, onAccept, onReject}) {
  const [callerName, setCallerName] = useState(null);

  useEffect(() => {
    const fetchCallerName = async () => {
      const name = await reverseResolveAddress(callerID);

      setCallerName(name);
    };

    fetchCallerName();
  }, [callerID]);
  return (
    <div className="mockup-phone border-primary">
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1 flex flex-col justify-between py-[50px]">
          <div>
            <p
              className={`text-bold text-primary ${
                callerName ? `text-3xl` : `text-xs`
              }`}
            >
              {callerName ?? callerID}
            </p>
            <p>is calling ...</p>
          </div>
          <div className="flex gap-16">
            {" "}
            <button
              className="btn btn-outline btn-success btn-info rounded-full"
              onClick={onAccept}
            >
              <IoMdCall size={30} />
            </button>
            <button
              className="btn btn-outline btn-error btn-info rounded-full"
              onClick={onReject}
            >
              <ImPhoneHangUp size={30} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
