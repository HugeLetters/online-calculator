import { atom } from "jotai";
import { expression } from "./expression.jotai.js";

export const displayExpression = atom(get =>
  get(expression)
    .map(x =>
      typeof x === "object"
        ? `${x.sign === -1 ? "-" : ""}${x.whole.join("")}${
            x.isDecimal ? `.${x.decimal.join("")}` : ""
          }`
        : x
    )
    .join("")
);
