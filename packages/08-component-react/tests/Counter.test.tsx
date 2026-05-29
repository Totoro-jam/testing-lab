import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Counter } from "../src/Counter";

describe("Counter", () => {
  it("显示初始 count", () => {
    render(<Counter initial={3} />);
    expect(screen.getByText("count: 3")).toBeInTheDocument();
  });

  it("点击 + 自增 or - 自减", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "+" }));

    expect(screen.getByText("count: 2")).toBeInTheDocument();
  });

  it("点击 - 自减", async () => {
    const user = userEvent.setup();
    render(<Counter initial={4} />);

    await user.click(screen.getByRole("button", { name: "-" }));
    await user.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("count: 2")).toBeInTheDocument();
  });

  it("onChange 回调被触发", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Counter onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "-" }));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 0);
  });
});
