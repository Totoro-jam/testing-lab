import { useState } from "react";

export function Counter({
  initial = 0,
  onChange,
}: {
  initial?: number;
  onChange?: (n: number) => void;
}) {
  const [count, setCount] = useState(initial);

  const update = (n: number) => {
    setCount(n);
    onChange?.(n);
  };

  return (
    <div>
      <p>count: {count}</p>
      <button aria-label="+" onClick={() => update(count + 1)}>
        +
      </button>
      <button aria-label="-" onClick={() => update(count - 1)}>
        -
      </button>
    </div>
  );
}
