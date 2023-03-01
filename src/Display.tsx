import { useAtomValue } from "jotai/react";
import { displayExpression as atom } from "./display.jotai";
import style from "./display.module.css";

export default function Display() {
  const expression = useAtomValue(atom);
  return <div className={style.display}>{expression}</div>;
}
