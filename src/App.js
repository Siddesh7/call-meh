import {useAccount, useWalletClient} from "wagmi";
import {getAddress} from "viem";
import "./App.css";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {useEffect, useRef, useState} from "react";
import {isEthereumAddress, resolveUnstoppableDomain} from "./util";
import {
  CONSTANTS,
  PushAPI,
  VideoCallStatus,
  video,
} from "@pushprotocol/restapi";
import IncomingCall from "./components/incomingCall";
import AudioPlayer from "./components/audioComponent";

function App() {
  const [recipient, setRecipient] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const aliceVideoCall = useRef();
  const [isPushStreamConnected, setIsPushStreamConnected] = useState(false);
  const [data, setData] = useState(video.initVideoCallData);
  const [showCallWindow, setShowCallWindow] = useState(false);
  const [videoEvent, setVideoEvent] = useState("");
  const {data: signer} = useWalletClient();
  const {address: walletAddress, isConnected: isWalletConnected} = useAccount();

  const initializePushAPI = async () => {
    const userAlice = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.PROD,
    });

    const createdStream = await userAlice.initStream([
      CONSTANTS.STREAM.VIDEO,
      CONSTANTS.STREAM.CONNECT,
      CONSTANTS.STREAM.DISCONNECT,
    ]);

    createdStream.on(CONSTANTS.STREAM.CONNECT, () => {
      console.log("Push Stream Connected");
      setIsPushStreamConnected(true);
    });

    createdStream.on(CONSTANTS.STREAM.DISCONNECT, () => {
      console.log("Push Stream Disconnected");
      setIsPushStreamConnected(false);
    });

    createdStream.on(CONSTANTS.STREAM.VIDEO, async (data) => {
      if (data.event === CONSTANTS.VIDEO.EVENT.REQUEST) {
        console.log("Video Call Requested");
        setVideoEvent(data);
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.APPROVE) {
        console.log("Video Call Approved");
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.DENY) {
        console.log("User Denied the Call");
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.CONNECT) {
        console.log("Video Call Connected");
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.DISCONNECT) {
        console.log("Video Call ended!");
      }
    });

    aliceVideoCall.current = await userAlice.video.initialize(setData, {
      stream: createdStream,
      config: {
        video: false,
        audio: true,
      },
    });

    await createdStream.connect();
  };
  useEffect(() => {
    if (!signer) return;
    if (data?.incoming[0]?.status !== VideoCallStatus.UNINITIALIZED) return; // data?.incoming[0]?.status will have a status of VideoCallStatus.UNINITIALIZED when the video call is not initialized, call ended or denied. So we Initialize the Push API here.
    initializePushAPI();
  }, [signer, data?.incoming[0]?.status]);

  const callUser = async () => {
    console.log("recipientAddress", recipientAddress);
    await aliceVideoCall.current.request([recipientAddress]);
    setShowCallWindow(true);
  };
  // This function is used to accept the incoming video call
  const acceptIncomingCall = async () => {
    await aliceVideoCall.current.approve(videoEvent?.peerInfo);
  };
  // This function is used to end the ongoing video call
  const endCall = async () => {
    await aliceVideoCall.current.disconnect(data?.incoming[0]?.address);
  };
  // This function is used to deny the incoming video call
  const denyIncomingCall = async () => {
    await aliceVideoCall.current.deny(videoEvent?.peerInfo);
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      {data?.incoming[0]?.status !== VideoCallStatus.CONNECTED && (
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl text-primary font-bold mb-[40px]">
              Call your UD fren
            </h1>
            {!isWalletConnected && (
              <div className="flex justify-center">
                {" "}
                <ConnectButton showBalance={false} />
              </div>
            )}
            {isWalletConnected && (
              <div>
                <input
                  type="text"
                  placeholder="type domain to call"
                  value={recipient}
                  onChange={async (e) => {
                    setRecipient(e.target.value);
                    const response = await resolveUnstoppableDomain(
                      e.target.value
                    );
                    if (response) {
                      setRecipientAddress(getAddress(response.meta.owner));
                    }
                  }}
                  className="input input-bordered input-primary w-full max-w-xs my-[20px]"
                />
                <button
                  className="btn btn-primary px-[20px]"
                  disabled={!isEthereumAddress(recipientAddress)}
                  onClick={callUser}
                >
                  call
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {data?.incoming[0]?.status === VideoCallStatus.CONNECTED && (
        <AudioPlayer
          mediaStream={data?.incoming[0]?.stream}
          name={data?.incoming[0]?.address}
          onEnd={endCall}
          onMute={aliceVideoCall.current?.media({
            audio: !data?.local.audio,
          })}
          isConnected={true}
        />
      )}
      {data?.incoming[0]?.status === VideoCallStatus.RECEIVED && (
        <IncomingCall
          name={videoEvent?.peerInfo?.address}
          onAccept={acceptIncomingCall}
          onReject={denyIncomingCall}
        />
      )}
    </div>
  );
}

export default App;
