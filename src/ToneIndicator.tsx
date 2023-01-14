import { common, components } from "replugged";
const { React } = common;
const { Tooltip } = components;

export interface ToneIndicatorProps {
  indicator: string;
  desc: string;
}

function ToneIndicator(props: ToneIndicatorProps): React.ReactElement {
  return (
    <Tooltip text={props.desc}>
      <span
        {...props}
        style={{
          backgroundColor: "var(--background-modifier-accent)",
          borderRadius: 3,
          padding: "0 2px",
        }}>
        /{props.indicator}
      </span>
    </Tooltip>
  );
}

export default ToneIndicator;
