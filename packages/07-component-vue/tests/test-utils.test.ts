// 对比演示 @vue/test-utils 路线
// 平时优先用 testing-library,这里只为让你看懂别人代码
import { mount } from "@vue/test-utils";
import Counter from "../src/Counter.vue";

describe("@vue/test-utils 风格", () => {
  it("mount + setProps", async () => {
    const wrapper = mount(Counter, { props: { initial: 10 } });
    expect(wrapper.text()).toContain("count: 10");

    await wrapper.setProps({ initial: 99 });
    // 注意:initial 只是初始值,setProps 改它不影响已有 ref(组件内部不响应)
    // 这正是为什么要测 DOM 而不是 prop 透传
    expect(wrapper.text()).toContain("count: 10");
  });

  it("trigger 点击 + emitted", async () => {
    const wrapper = mount(Counter);
    await wrapper.find('button[aria-label="+"]').trigger("click");

    expect(wrapper.text()).toContain("count: 1");
    expect(wrapper.emitted("change")).toBeTruthy();
    expect(wrapper.emitted("change")![0]).toEqual([1]);
  });
});

// 何时选 test-utils 而非 testing-library?
//   - 需要测 provide/inject 等 Vue 特性
//   - 用 stub 替换子组件:mount(X, { global: { stubs: { ChildCmp: true } } })
//   - 需要直接断言组件实例的某些复杂状态(罕见)
