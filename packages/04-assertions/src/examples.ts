// 一些"被断言的样本数据" —— 这章本身没什么被测逻辑,重点在 expect 怎么用

export const sampleUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  roles: ["admin", "editor"],
  profile: {
    age: 30,
    city: "Shanghai",
  },
};

export const sampleUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
];

export function divideStrict(a: number, b: number): number {
  if (b === 0) throw new TypeError("Cannot divide by zero");
  return a / b;
}
