import { render, screen } from "@testing-library/react";
import { Hello } from "../src/Hello";

describe("Hello", () => {
  it("渲染 name", () => {
    render(<Hello name="Alice" />);
    expect(screen.getByText("Hello, Alice")).toBeInTheDocument();
  });
});
