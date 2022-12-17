import React from "react";

export interface ToneIndicatorProps {
  indicator: string;
  desc: string;
}

function ToneIndicator(Tooltip: typeof React.Component) {
  return (node: ToneIndicatorProps): React.ReactElement => {
    if (!Tooltip) {
      console.log("not found");
      return <span>/{node.indicator}</span>;
    }
    return (
      <Tooltip text={node.desc}>
        {(props: React.HTMLAttributes<HTMLSpanElement>) => (
          <span
            {...props}
            style={{
              backgroundColor: "var(--background-modifier-accent)",
              borderRadius: 3,
              padding: "0 2px",
            }}>
            /{node.indicator}
          </span>
        )}
      </Tooltip>
    );
  };
}

export default ToneIndicator;
