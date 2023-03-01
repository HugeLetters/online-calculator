import { atomWithReducer } from "jotai/utils";
import produce from "immer";
import { action, addAction, decimal, digit, expressionAtom, operator } from "./types";

const defaultAtom = [{ sign: 1, whole: [0], isDecimal: false }] as expressionAtom[];

export const expression = atomWithReducer(
  defaultAtom,
  produce((draft, action: action) => {
    switch (action.type) {
      case "ADD":
        applyAddAction(draft, action);
        break;
      case "POP":
        draft.pop();
        break;
      case "RESET":
        return defaultAtom;
      case "COMPUTE":
        return compute(draft);
    }
  })
);

function applyAddAction(state: expressionAtom[], action: addAction) {
  switch (action.valueType) {
    case "DIGIT":
      applyAddDigit(state, action.value);
      break;
    case "DOT":
      applyAddDot(state);
      break;
    case "OPERATOR":
      applyAddOperator(state, action.value);
  }
}

function applyAddDot(state: expressionAtom[]) {
  const last = state[state.length - 1];
  if (typeof last === "object") {
    last.isDecimal = true;
    if (last.isDecimal === true) last.decimal ??= [];
    return;
  }
  state.push({ isDecimal: true, whole: [], sign: 1, decimal: [] });
}

function applyAddDigit(state: expressionAtom[], value: digit) {
  if (!state.length) return (state[0] = { sign: 1, whole: [value], isDecimal: false });

  const last = state[state.length - 1];
  if (typeof last === "object") return applyAddDigitToDecimal(last, value);

  state.push({ sign: 1, whole: [value], isDecimal: false });
}

function applyAddDigitToDecimal(decimal: decimal, value: digit) {
  decimal.isDecimal
    ? decimal.decimal.push(value)
    : decimal.whole.length === 1 && decimal.whole[0] === 0
    ? (decimal.whole[0] = value)
    : decimal.whole.push(value);
}

function applyAddOperator(state: expressionAtom[], value: operator) {
  if (!state.length && value == "-") return (state[0] = { sign: -1, whole: [], isDecimal: false });
  if (!state.length) return;

  const last = state[state.length - 1];
  if (typeof last === "object") return state.push(value);

  value === "-"
    ? state.push({ sign: -1, whole: [], isDecimal: false })
    : (state[state.length - 1] = value);
}

function compute(expression: expressionAtom[]) {
  let skip = false;
  const firstOrder = expression.reduce((result, part, i, array) => {
    if (skip) {
      skip = false;
      return result;
    }
    if (part === "x" || part === "/") {
      const last = result.pop();
      const next = array[i + 1];
      if (typeof last !== "string" && typeof next !== "string") {
        result.push(singleOperation(last ?? 1, next ?? 1, part));
        skip = true;
      }
    } else {
      result.push(part);
    }
    return result;
  }, [] as (string | numeric)[]);
  skip = false;
  const secondOrder = firstOrder.reduce((result, part, i, array) => {
    if (typeof result === "string") return 0;
    if (skip) {
      skip = false;
      return result;
    }
    if (part === "+" || part === "-") {
      const next = array[i + 1];
      if (typeof next !== "string") {
        result = singleOperation(result, next ?? 0, part);
        skip = true;
      }
    }
    return result;
  }) as numeric;

  console.log({ secondOrder });

  return [numberToDecimal(secondOrder)];
}

function decimalToNumber(decimal: numeric) {
  return typeof decimal === "number"
    ? decimal
    : decimal.sign *
        (decimal.whole.reduce((sum: number, x) => sum * 10 + x, 0) +
          (decimal.isDecimal
            ? decimal.decimal.reduce((sum: number, x, i) => sum + x * 10 ** -(i + 1), 0)
            : 0));
}

function singleOperation(value1: numeric, value2: numeric, operator: operator) {
  return {
    x: (x1: numeric, x2: numeric) => decimalToNumber(x1) * decimalToNumber(x2),
    "/": (x1: numeric, x2: numeric) => decimalToNumber(x1) / decimalToNumber(x2),
    "-": (x1: numeric, x2: numeric) => decimalToNumber(x1) - decimalToNumber(x2),
    "+": (x1: numeric, x2: numeric) => decimalToNumber(x1) + decimalToNumber(x2),
  }[operator](value1, value2);
}

type numeric = decimal | number;

function numberToDecimal(number: numeric): decimal {
  if (typeof number === "object") return number;

  const decimalDigits = 10;

  const sign = number ? number / Math.abs(number) : 1;
  const decimal = (
    "" +
    Math.round(Math.abs(number % 1) * 10 ** decimalDigits) / 10 ** decimalDigits
  )
    .slice(2)
    .split("")
    .map(e => parseInt(e) ?? 0);
  const whole = ("" + Math.abs(number - (number % 1))).split("").map(e => parseInt(e) ?? 0);
  const result = {};
  Object.assign(result, { sign, whole });
  decimal.length && Object.assign(result, { isDecimal: true, decimal });

  console.log({ result, number: "" + Math.abs(number - (number % 1)) });
  return result as decimal;
}
