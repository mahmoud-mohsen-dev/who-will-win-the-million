import Button from "./Button";
import FiftyChance from "../assets/50.svg?react";
import NoAudio from "../assets/No_Audio.svg?react";
import Call from "../assets/call.svg?react";
import People from "../assets/People.svg?react";
import Audio from "../assets/audio.svg?react";
import Withdraw from "../assets/withdraw.svg?react";
import { HelperToolsProps, MyDispatch } from "../lib/Types";

const trigerAfterSeconds = (num: number, myDispatch: MyDispatch) => {
    setTimeout(() => {
        myDispatch({ type: "changeAudioAfterDelay" });
    }, num);
};

function HelperTools({
    withdraw,
    answeredQuestionsLength,
    askTheAudience,
    deleteTwoOptions,
    audio,
    callYourFriend,
    dispatch,
}: HelperToolsProps) {
    const handleSound = () => {
        dispatch({
            type: "toggleOnOffSounds",
        });
    };
    const handleWithdraw = () => {
        const canWithdraw =
            answeredQuestionsLength % 5 === 0 && answeredQuestionsLength !== 0;
        if (canWithdraw) {
            dispatch({ type: "withdraw" });
        }
    };
    const handlePeople = () => {
        dispatch({ type: "askTheAudience" });
        trigerAfterSeconds(9000, dispatch);
    };
    const handleFiftyChance = () => {
        if (deleteTwoOptions.count === 0) {
            dispatch({ type: "deleteTwoOptions" });
            trigerAfterSeconds(2000, dispatch);
        }
    };
    const handleCall = () => {
        dispatch({
            type: "callYourFriend",
            isOpen: true,
            audio: {
                bgIsOn: false,
                effectIsOn: audio.backgroundAudioIsOn,
                effectSrc: "../src/sounds/phone-a-friend.mp3",
            },
        });
        // trigerAfterSeconds(30000, dispatch);
    };

    return (
        <section className="helper-tools">
            <Button sound={true} handleFunc={handleSound}>
                {audio.backgroundAudioIsOn || audio.effectsAudioIsOn ? (
                    <Audio />
                ) : (
                    <NoAudio />
                )}
            </Button>
            <Button withdraw={withdraw} handleFunc={handleWithdraw}>
                <Withdraw />
            </Button>
            <Button
                handleFunc={handlePeople}
                disabled={askTheAudience?.count > 1 || askTheAudience.hasAsked}
            >
                <People />
            </Button>
            <Button
                fifty={true}
                handleFunc={handleFiftyChance}
                disabled={deleteTwoOptions.hasDeleted}
            >
                <FiftyChance />
            </Button>
            <Button handleFunc={handleCall} disabled={callYourFriend?.hasAsked}>
                <Call />
            </Button>
        </section>
    );
}

export default HelperTools;
