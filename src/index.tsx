import { common } from "replugged";
import indicators from "./indicators";
import ToneIndicator from "./ToneIndicator";
import { DefaultInRule } from "simple-markdown";

const { parser } = common;
const defaultRules = parser.defaultRules as typeof parser.defaultRules & {
  toneIndicator?: DefaultInRule;
};

const LOOKBEHIND_PATTERN = /(?:\p{P}|\s)$/u;
const INDICATOR_PATTERN = /^\/([a-z]+)(?=\p{P}|$|\s)/iu;

function getIndicator(text: string): string | null {
  text = text.toLowerCase();
  return indicators.get(text) ?? indicators.get(`_${text}`) ?? null;
}

function refresh(): void {
  parser.parse = parser.reactParserFor(defaultRules);
}

export function start(): void {
  // @ts-expect-error ???
  defaultRules.toneIndicator = {
    order: defaultRules.text.order - 1,
    match: (source: string, state) => {
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
    react: (node) => <ToneIndicator indicator={node.indicator} desc={node.desc} />,
  };

  refresh();
}

export function stop(): void {
  if (!parser) return;
  delete defaultRules.toneIndicator;

  refresh();
}
