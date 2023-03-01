export type action = { type: "POP" | "RESET" | "COMPUTE" } | addAction;
export type addAction = { type: "ADD" } & (addOperator | addDigit | addDot);
export type addOperator = { valueType: "OPERATOR"; value: operator };
export type addDigit = { valueType: "DIGIT"; value: digit };
export type addDot = { valueType: "DOT" };

export type expressionAtom = operator | decimal;
export type operator = typeof operators[number];
export type decimal = {
  sign: sign;
  whole: digit[];
} & (
  | {
      isDecimal: false;
    }
  | {
      isDecimal: true;
      decimal: digit[];
    }
);

export const operators = ["/", "x", "-", "+"] as const;
export type sign = 1 | -1;
export type digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
