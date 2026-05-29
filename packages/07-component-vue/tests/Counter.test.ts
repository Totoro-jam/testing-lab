import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import Counter from "../src/Counter.vue";

describe("Counter.vue", () => {
  it("初始值默认 0", () => {
    render(Counter);
    expect(screen.getByText("count: 0")).toBeInTheDocument();
  });

  it("initial prop 设置起始值", () => {
    render(Counter, { props: { initial: 5 } });
    expect(screen.getByText("count: 5")).toBeInTheDocument();
  });

  it("点击 + 自增", async () => {
    const user = userEvent.setup();
    render(Counter);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "+" }));

    expect(screen.getByText("count: 2")).toBeInTheDocument();
  });

  it("emit change 事件携带新值", async () => {
    const user = userEvent.setup();
    const { emitted } = render(Counter);

    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "-" }));

    const events = emitted().change as unknown[][];
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual([1]);
    expect(events[1]).toEqual([0]);
  });
});
