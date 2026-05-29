import { render, screen } from "@testing-library/react";
import { Hello } from "../src/Hello";

describe("Hello", () => {
  it("传 name 渲染传入值", () => {
    render(<Hello name="Alice" />);
    expect(screen.getByText("Hello, Alice")).toBeInTheDocument();
  });

  it.each([
    { label: "不传 name", props: {} },
    { label: "传 undefined", props: { name: undefined } },
  ])("$label → 走默认值", ({ props }) => {
    render(<Hello {...props} />);
    expect(screen.getByText("Hello, World")).toBeInTheDocument();
  });

  it("传 name=空字符串 不走默认值", () => {
    render(<Hello name="" />);
    expect(screen.getByText("Hello,")).toBeInTheDocument();
  });
});
