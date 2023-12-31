import { AnswerProps } from "../lib/Types";
import AnswerTimer from "./AnswerTimer";
import Field from "./Field";

function Answers({
    question,
    optionClicked,
    deleteTwoOptions,
    dispatch,
}: AnswerProps) {
    const cantDelete = (i: number) =>
        deleteTwoOptions.firstOption === i ||
        deleteTwoOptions.secondOption === i;

    return (
        <div className="answers">
            <AnswerTimer
                myClassesNames="answers__timer-absolute-center"
                classAnimation="bg-danger"
                syncWith={question}
                dispatch={dispatch}
            />
            {question.options.map((option, i) => {
                return (
                    <Field
                        text={"( " + (i + 1) + " ) " + option}
                        index={i}
                        deleteThisOption={
                            deleteTwoOptions.hasDeleted &&
                            !cantDelete(i) &&
                            deleteTwoOptions.firstOption !== null &&
                            deleteTwoOptions.secondOption !== null
                        }
                        dispatch={dispatch}
                        clicked={optionClicked}
                        question={question}
                        key={"o-" + i}
                    />
                );
            })}
        </div>
    );
}

export default Answers;
