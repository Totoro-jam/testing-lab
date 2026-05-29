import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { LoginForm } from "../src/LoginForm";

describe("LoginForm", () => {
  it("正常提交", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.type(screen.getByLabelText(/password/i), "123456");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "123456",
    });
  });

  it("非法 email 显示错误,不调 onSubmit", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "no-at-sign");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("invalid email");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("修正 email 后,error 消失", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "no-at-sign");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), "ok@ok.com");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
