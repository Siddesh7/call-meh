import {IoMdCall} from "react-icons/io";
import {ImPhoneHangUp} from "react-icons/im";
export default function IncomingCall({name, onAccept, onReject}) {
  return (
    <div className="mockup-phone border-primary absolute bg-black w-[100vw] h-[100vh]">
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1 flex flex-col justify-between py-[50px]">
          <div>
            <p className="text-bold text-4xl text-primary">{name}</p>
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
