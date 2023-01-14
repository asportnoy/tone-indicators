import { common } from "replugged";
import indicators from "./indicators";
import ToneIndicator from "./ToneIndicator";

const { parser } = common;

const LOOKBEHIND_PATTERN = /(?:\p{P}|\s)$/u;
const INDICATOR_PATTERN = /^\/([a-z]+)(?=\p{P}|$|\s)/iu;

function getIndicator(text: string): string | null {
  text = text.toLowerCase();
  return indicators.get(text) ?? indicators.get(`_${text}`) ?? null;
}

function refresh(): void {
  parser.parse = parser.reactParserFor(parser.defaultRules);
}

export function start(): void {
  parser.defaultRules.toneIndicator = {
    order: parser.defaultRules.text.order - 1,
    match: (source, state) => {
      if (state.prevCapture && !LOOKBEHIND_PATTERN.test(state.prevCapture[0])) {
        return null;
      }
      const match = INDICATOR_PATTERN.exec(source);
      if (match === null) return null;
      const desc = getIndicator(match[1]);
      if (desc === null) return null;
      return match;
    },
    parse: (match) => ({
      indicator: match[1],
      desc: getIndicator(match[1]),
    }),
    react: ToneIndicator,
  };

  refresh();
}

export function stop(): void {
  if (!parser) return;
  delete parser.defaultRules.toneIndicator;

  refresh();
}
