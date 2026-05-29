import { render, screen, waitForElementToBeRemoved } from "@testing-library/vue";
import UserCard from "../src/UserCard.vue";

describe("UserCard.vue (异步)", () => {
  it("先 loading,再显示用户名", async () => {
    render(UserCard, { props: { id: 1 } });

    expect(screen.getByText("loading...")).toBeInTheDocument();

    // 等 loading 消失
    await waitForElementToBeRemoved(() => screen.queryByText("loading..."));

    expect(screen.getByText("User1")).toBeInTheDocument();
  });

  it("findByText 等待异步内容出现", async () => {
    render(UserCard, { props: { id: 42 } });
    expect(await screen.findByText("User42")).toBeInTheDocument();
  });

  it("id 为负 显示 error", async () => {
    render(UserCard, { props: { id: -1 } });
    expect(await screen.findByRole("alert")).toHaveTextContent("invalid");
  });
});
