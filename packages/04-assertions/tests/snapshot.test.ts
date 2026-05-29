import { sampleUser } from "../src/examples";

describe("快照测试", () => {
  it("toMatchSnapshot — 第一次跑写到 __snapshots__/xxx.snap", () => {
    expect(sampleUser).toMatchSnapshot();
  });

  it("toMatchInlineSnapshot — 写在当前文件里,review 时一眼看见", () => {
    expect({ a: 1, b: "hello" }).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": "hello",
      }
    `);
  });

  it("快照可以加属性匹配器,忽略某些不稳定字段", () => {
    const response = {
      id: "random-uuid-xxx",
      createdAt: new Date(),
      data: { count: 42 },
    };

    // expect.any 让快照"接受任何 string/Date",只比对结构和稳定字段
    expect(response).toMatchSnapshot({
      id: expect.any(String),
      createdAt: expect.any(Date),
    });
  });
});

// 真实项目使用快照原则:
// 1. 仅用于"结构稳定、变化即异常"的对象
// 2. 失败时人工 diff,不要无脑 --update
// 3. 快照文件 必须 进 git review
