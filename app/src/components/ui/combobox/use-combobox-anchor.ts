import * as React from "react";

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export { useComboboxAnchor };
