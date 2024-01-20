import React, {useEffect, useRef, useState} from "react";
import {useAccount, useWalletClient} from "wagmi";
import {
  PushAPI,
  CONSTANTS,
  VideoCallStatus,
  video,
} from "@pushprotocol/restapi";
import AudioPlayer from "./components/AudioPlayer";
import IncomingCall from "./components/incomingCall";
import {getAddress} from "viem";
import {isEthereumAddress, resolveUnstoppableDomain} from "./util";
import {ConnectButton} from "@rainbow-me/rainbowkit";

const VideoV2 = () => {
  const {isConnected} = useAccount();
  const {data: signer} = useWalletClient();
  const aliceVideoCall = useRef();
  const [latestVideoEvent, setLatestVideoEvent] = useState(null);
  const [isPushStreamConnected, setIsPushStreamConnected] = useState(false);
  const [data, setData] = useState(video.initVideoCallData);
  const [recipientAddress, setRecipientAddress] = useState();
  const [recipient, setRecipient] = useState();
  const initializePushAPI = async () => {
    const userAlice = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.DEV,
    });
    const createdStream = await userAlice.initStream([
      CONSTANTS.STREAM.VIDEO,
      CONSTANTS.STREAM.CONNECT,
      CONSTANTS.STREAM.DISCONNECT,
    ]);
    createdStream.on(CONSTANTS.STREAM.CONNECT, () => {
      setIsPushStreamConnected(true);
    });
    createdStream.on(CONSTANTS.STREAM.DISCONNECT, () => {
      setIsPushStreamConnected(false);
    });
    createdStream.on(CONSTANTS.STREAM.VIDEO, async (data) => {
      if (data.event === CONSTANTS.VIDEO.EVENT.REQUEST) {
        setLatestVideoEvent(data);
      }
      if (data.event === CONSTANTS.VIDEO.EVENT.APPROVE) {
        console.log("Video Call Approved");
      }
      if (data.event === CONSTANTS.VIDEO.EVENT.DENY) {
        alert("User Denied the Call");
      }
      if (data.event === CONSTANTS.VIDEO.EVENT.CONNECT) {
        console.log("Video Call Connected");
      }
      if (data.event === CONSTANTS.VIDEO.EVENT.DISCONNECT) {
        alert("Video Call ended!");
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
    if (data?.incoming[0]?.status !== VideoCallStatus.UNINITIALIZED) return;
    initializePushAPI();
  }, [signer, data.incoming[0].status]);

  useEffect(() => {
    console.log("isPushStreamConnected", isPushStreamConnected);
  }, [isPushStreamConnected, latestVideoEvent]);

  const acceptIncomingCall = async () => {
    await aliceVideoCall.current.approve(latestVideoEvent?.peerInfo);
  };

  const denyIncomingCall = async () => {
    await aliceVideoCall.current.deny(latestVideoEvent?.peerInfo);
  };

  const endCall = async () => {
    await aliceVideoCall.current.disconnect(data?.incoming[0]?.address);
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {data?.incoming[0]?.status !== VideoCallStatus.CONNECTED && (
            <h1 className="text-5xl text-primary font-bold mb-[40px]">
              Call your UD fren
            </h1>
          )}

          {isConnected ? (
            <div>
              {data?.incoming[0]?.status !== VideoCallStatus.CONNECTED && (
                <div>
                  {" "}
                  {data.incoming[0].status !== VideoCallStatus.RECEIVED ? (
                    <div>
                      {" "}
                      <input
                        onChange={async (e) => {
                          setRecipient(e.target.value);
                          const response = await resolveUnstoppableDomain(
                            e.target.value
                          );
                          if (response) {
                            setRecipientAddress(getAddress(response));
                          }
                        }}
                        value={recipient}
                        placeholder="UD domain"
                        type="text"
                        className="input input-bordered input-primary w-full max-w-xs my-[20px]"
                      />
                      <button
                        className="btn btn-primary px-[20px]"
                        disabled={!isEthereumAddress(recipientAddress)}
                        onClick={async () => {
                          await aliceVideoCall.current.request([
                            recipientAddress,
                          ]);
                        }}
                      >
                        call
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      {data.incoming[0].status === VideoCallStatus.RECEIVED && (
                        <IncomingCall
                          callerID={latestVideoEvent?.peerInfo?.address}
                          onAccept={acceptIncomingCall}
                          onReject={denyIncomingCall}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
              {data?.incoming[0]?.status === VideoCallStatus.CONNECTED && (
                <AudioPlayer
                  onEnd={endCall}
                  onMute={() => {
                    aliceVideoCall.current?.media({
                      audio: !data?.local.audio,
                    });
                  }}
                  audioState={data?.local.audio}
                  peerAddress={data?.incoming[0]?.address}
                  stream={data.incoming[0].stream}
                />
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              {" "}
              <ConnectButton showBalance={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoV2;
