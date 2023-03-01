import { useSetAtom } from "jotai";
import { expression } from "./expression.jotai.js";
import { digit, operator, operators } from "./types.js";
import style from "./inputs.module.css";

export default function Input() {
  const dispatch = useSetAtom(expression);

  return (
    <div className={style.input}>
      <Operators
        onClick={operator => dispatch({ type: "ADD", valueType: "OPERATOR", value: operator })}
      />
      <Digits
        onDigit={digit => dispatch({ type: "ADD", valueType: "DIGIT", value: digit })}
        onDot={() => dispatch({ type: "ADD", valueType: "DOT" })}
      />
      <div className={style.controls}>
        <button onClick={() => dispatch({ type: "POP" })}>CE</button>
        <button onClick={() => dispatch({ type: "RESET" })}>AC</button>
        <button
          className={style.compute}
          onClick={() => dispatch({ type: "COMPUTE" })}
        >
          =
        </button>
      </div>
    </div>
  );
}

function Digits({ onDigit, onDot }: digitProps) {
  const triple = Array(3).fill(0);
  return (
    <div className={style.digits}>
      {triple.map((_, row) =>
        triple.map((_, col) => {
          const value = ((2 - row) * 3 + col + 1) as digit;
          return (
            <button
              key={col}
              onClick={() => onDigit(value)}
            >
              {value}
            </button>
          );
        })
      )}
      <button
        className={style.zero}
        onClick={() => onDigit(0)}
      >
        0
      </button>
      <button onClick={() => onDot()}>.</button>
    </div>
  );
}

type digitProps = {
  onDigit: (digit: digit) => void;
  onDot: () => void;
};

function Operators({ onClick }: operatorProps) {
  return (
    <div className={style.operators}>
      {operators.map(operator => (
        <button
          key={operator}
          onClick={() => onClick(operator)}
        >
          {operator}
        </button>
      ))}
    </div>
  );
}

type operatorProps = {
  onClick: (operator: operator) => void;
};
