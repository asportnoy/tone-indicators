import React from "react";
import { ModuleExports, webpack } from "replugged";
import indicators from "./indicators";
import toneIndicator, { ToneIndicatorProps } from "./ToneIndicator";

interface State {
  prevCapture: RegExpExecArray | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Rule<T = any> {
  order: number;
  match: (source: string, state: State) => RegExpExecArray | null;
  parse: (match: RegExpExecArray) => T;
  react: (props: T) => React.ReactElement;
}

interface Parser {
  parse: (args: unknown) => React.ReactElement;
  reactParserFor(rules: Record<string, Rule>): (args: unknown) => React.ReactElement;
  defaultRules: Record<string, Rule>;
}

const LOOKBEHIND_PATTERN = /(?:\p{P}|\s)$/u;
const INDICATOR_PATTERN = /^\/([a-z]+)(?=\p{P}|$|\s)/iu;

const TOOLTIP_RGX = /shouldShowTooltip:!1/;

function getIndicator(text: string): string | null {
  text = text.toLowerCase();
  return indicators.get(text) ?? indicators.get(`_${text}`) ?? null;
}

function refresh(parser: Parser): void {
  parser.parse = parser.reactParserFor(parser.defaultRules);
}

let parser: Parser | null;

export async function start(): Promise<void> {
  parser = await webpack.waitForModule<ModuleExports & Parser>(
    webpack.filters.byProps("parse", "parseTopic"),
  );

  const tooltipMod = await webpack.waitForModule<Record<string, typeof React.Component>>(
    webpack.filters.bySource(TOOLTIP_RGX),
  );
  const Tooltip =
    tooltipMod && webpack.getFunctionBySource<typeof React.Component>(TOOLTIP_RGX, tooltipMod);
  if (!Tooltip) {
    console.error("Failed to find Tooltip component");
    return;
  }

  const ToneIndicator = toneIndicator(Tooltip);

  const rule = {
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
  } as Rule<ToneIndicatorProps>;

  parser.defaultRules.toneIndicator = rule;

  refresh(parser);
}

export function stop(): void {
  if (!parser) return;
  delete parser.defaultRules.toneIndicator;
  refresh(parser);
}
