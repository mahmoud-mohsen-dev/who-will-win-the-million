import { useState, useEffect, useCallback, useRef } from "react";
import Progress from "./Progress";
import KeyDownBtn from "./KeyDownBtn";
import Timer from "./Timer";
import { ModalCallProps } from "../lib/Types";

// Debounce function for handling resize events
const debounce = (fn: () => void, delay: number) => {
    let timeoutId: number;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn();
        }, delay);
    };
};

function ModalCall({
    callYourFriend,
    currentQuestion,
    audio,
    dispatch,
}: ModalCallProps) {
    const firstMount = useRef(0);
    const [keysPressed, setKeysPressed] = useState({
        ArrowRight: false,
        ArrowLeft: false,
        touch: false,
    });
    const [countKeyRightAndLeftPressed, setCountKeyRightAndLeftPressed] =
        useState(0);
    const [countTouched, setCountTouched] = useState(0);
    const [timeoutId, setTimeoutId] = useState<number | null>(null);
    const [bothClicked, setBothClicked] = useState(false);
    const [innerWidth, setInnerWidth] = useState<number | null>(null);
    const [time, setTime] = useState(30);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                if (!keysPressed[event.key]) {
                    setKeysPressed((prevState) => ({
                        ...prevState,
                        [event.key]: true,
                    }));

                    // Set a timeout to clear the keysPressed state after 5 milliseconds
                    setTimeoutId(setTimeout(() => clearKeysPressed(), 25));
                }
            }
        },
        [keysPressed]
    );

    const handleKeyUp = useCallback(() => {
        // Clear the timeout if a key is released before the 5 milliseconds elapse
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        clearKeysPressed();
    }, [timeoutId]);

    const clearKeysPressed = () => {
        setKeysPressed({ ArrowRight: false, ArrowLeft: false, touch: false });
        setBothClicked(false);
    };

    const handleTouchStart = useCallback(() => {
        setKeysPressed((prevState) => ({
            ...prevState,
            touch: true,
        }));
        setTimeoutId(setTimeout(() => clearKeysPressed(), 25));
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        clearKeysPressed();
    }, [timeoutId]);

    useEffect(() => {
        document.addEventListener(
            "touchstart",
            handleTouchStart as EventListener
        );
        document.addEventListener("touchend", handleTouchEnd as EventListener);

        return () => {
            document.removeEventListener(
                "touchstart",
                handleTouchStart as EventListener
            );
            document.removeEventListener(
                "touchend",
                handleTouchEnd as EventListener
            );
        };
    }, [handleTouchStart, handleTouchEnd]);

    const handleResize = useCallback(() => {
        setInnerWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown as EventListener);
        document.addEventListener("keyup", handleKeyUp as EventListener);

        // Remove the event listeners when the component unmounts
        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown as EventListener
            );
            document.removeEventListener("keyup", handleKeyUp as EventListener);
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        const debouncedResize = debounce(handleResize, 200);

        window.addEventListener("resize", debouncedResize);

        return () => {
            window.removeEventListener("resize", debouncedResize);
        };
    }, [handleResize]);

    useEffect(() => {
        // Check if both ArrowRight and ArrowLeft are pressed
        if (keysPressed.ArrowRight && keysPressed.ArrowLeft) {
            setCountKeyRightAndLeftPressed((prev) => prev + 1);
            setBothClicked(true);
        }
        if (keysPressed.touch) {
            setCountTouched((prev) => prev + 1);
        }
    }, [keysPressed]);

    useEffect(() => setInnerWidth(window.innerWidth), []);

    let playerWin: boolean = false;
    let playerLost: boolean = false;
    const targetPressed = 60;
    if (innerWidth && innerWidth > 1000) {
        playerWin =
            !(time <= 0) && countKeyRightAndLeftPressed >= targetPressed;
        playerLost = time <= 0 && countKeyRightAndLeftPressed < targetPressed;
    }
    if (innerWidth && innerWidth <= 1000) {
        playerWin = !(time <= 0) && countTouched >= targetPressed;
        playerLost = time <= 0 && countTouched < targetPressed;
    }

    useEffect(() => {
        if ((playerWin || playerLost) && firstMount.current <= 1) {
            firstMount.current++;
            if (playerWin) {
                dispatch({
                    type: "callYourFriend",
                    OpenTarget: true,
                    audio: {
                        bgIsOn: false,
                        effectIsOn: audio.appAudioIsOn,
                        effectSrc: `sounds/answer-${
                            currentQuestion.correct + 1
                        }.mp3`,
                    },
                });
                setTimeout(
                    () =>
                        dispatch({
                            type: "callYourFriend",
                            OpenTarget: false,
                            audio: {
                                bgIsOn: audio.appAudioIsOn,
                                effectIsOn: false,
                            },
                        }),
                    16000
                );
            }
            if (playerLost) {
                dispatch({
                    type: "changeAudioAfterDelay",
                });
                setTimeout(
                    () =>
                        dispatch({
                            type: "callYourFriend",
                            audio: {
                                bgIsOn: audio.appAudioIsOn,
                                effectIsOn: false,
                            },
                        }),
                    1200
                );
            }
        }
    }, [
        playerWin,
        playerLost,
        audio.appAudioIsOn,
        currentQuestion.correct,
        dispatch,
    ]);

    return (
        <div className="ModalCall ">
            <div
                className={`modal ${
                    callYourFriend.isOpen ? "open friend" : ""
                } ${playerWin ? "close success" : ""}  ${
                    playerLost ? "close danger" : ""
                }`}
            >
                <div
                    className={`modal__content ${
                        callYourFriend.isOpen ? "open friend" : ""
                    } modal-call ${playerWin ? "close success" : ""} ${
                        playerLost ? "close danger" : ""
                    }`}
                >
                    {!(time <= 0) && !playerWin && (
                        <>
                            <Timer time={time} setTime={setTime} />
                            <Progress
                                correctQsLength={
                                    countKeyRightAndLeftPressed || countTouched
                                }
                                max={targetPressed}
                                dispatch={dispatch}
                            />
                            <h2>
                                {innerWidth && innerWidth > 1000
                                    ? "اضغط علي زرار اليمين و اليسار في نفس الوقت علي الكيبورد لتعرف الاجابة"
                                    : "اضغط علي الزرار لتعرف الاجابة"}
                            </h2>
                            <div className="btns">
                                {innerWidth && innerWidth > 1000 ? (
                                    <>
                                        <KeyDownBtn
                                            name="زرار اليمين"
                                            isDown={
                                                bothClicked
                                                    ? true
                                                    : keysPressed.ArrowRight
                                            }
                                        />
                                        <KeyDownBtn
                                            name="زرار اليسار"
                                            isDown={
                                                bothClicked
                                                    ? true
                                                    : keysPressed.ArrowLeft
                                            }
                                        />
                                    </>
                                ) : (
                                    <KeyDownBtn
                                        name="اتصل بصديقك"
                                        isDown={keysPressed.touch}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    {playerWin && !audio.appAudioIsOn && (
                        <h2 style={{ color: "white", fontSize: "40px" }}>
                            الإجابة هي {currentQuestion.correct + 1}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModalCall;
