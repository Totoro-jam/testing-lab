# 断言速查表(Vitest / Jest 通用)

> 90% 的项目里你只会用到下面这些。背完这一页基本读得懂所有 JS 测试代码。

---

## 1. 相等

| 断言 | 用途 | 注意 |
|---|---|---|
| `toBe(x)` | 原始类型严格相等 `===` | 对象比引用,不比值 |
| `toEqual(x)` | 深度结构相等(忽略 undefined 字段) | **对象/数组用这个** |
| `toStrictEqual(x)` | 更严格:不忽略 undefined,不混淆 class vs plain obj | 推荐当你有 class 实例 |
| `toBeCloseTo(x, digits?)` | 浮点近似(默认 2 位小数) | `0.1+0.2 !== 0.3` 时用 |

```ts
expect(1).toBe(1)
expect({ a: 1 }).toEqual({ a: 1, b: undefined })   // ✅
expect({ a: 1 }).toStrictEqual({ a: 1, b: undefined })  // ❌
expect(0.1 + 0.2).toBeCloseTo(0.3)
```

---

## 2. 真值 / 空值

```ts
expect(x).toBeTruthy()         // !!x
expect(x).toBeFalsy()
expect(x).toBeNull()
expect(x).toBeUndefined()
expect(x).toBeDefined()
expect(x).toBeNaN()
```

---

## 3. 数字

```ts
expect(n).toBeGreaterThan(3)
expect(n).toBeGreaterThanOrEqual(3)
expect(n).toBeLessThan(3)
expect(n).toBeLessThanOrEqual(3)
```

---

## 4. 字符串

```ts
expect(s).toMatch('foo')         // 子串
expect(s).toMatch(/foo/)         // 正则
expect(s).toContain('foo')       // 同上,语义弱一点
```

---

## 5. 数组 / 集合

```ts
expect(arr).toContain('a')                    // 包含元素
expect(arr).toContainEqual({ id: 1 })         // 包含结构相等的对象
expect(arr).toHaveLength(3)
expect(set).toContain('a')
```

---

## 6. 对象

```ts
expect(obj).toHaveProperty('a.b.c')
expect(obj).toHaveProperty('a.b.c', 5)        // + 期望值
expect(obj).toMatchObject({ name: 'Alice' })  // 子集匹配
```

---

## 7. 部分匹配(配 toEqual 用)

```ts
expect(obj).toEqual(expect.objectContaining({ name: 'A' }))
expect(arr).toEqual(expect.arrayContaining(['a', 'b']))
expect(str).toEqual(expect.stringContaining('foo'))
expect(str).toEqual(expect.stringMatching(/^foo/))
expect(val).toEqual(expect.any(Number))       // 任意 number
expect(val).toEqual(expect.anything())        // 任意非 null/undefined
```

---

## 8. 异常

```ts
expect(() => f()).toThrow()
expect(() => f()).toThrow('message')
expect(() => f()).toThrow(/regex/)
expect(() => f()).toThrow(TypeError)
```

---

## 9. Promise

```ts
await expect(p).resolves.toBe(1)
await expect(p).rejects.toThrow(Error)

// 别忘了 await,否则断言静默失效
```

---

## 10. Mock function

```ts
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith('a', 'b')         // 任一次匹配
expect(fn).toHaveBeenNthCalledWith(2, 'b')        // 第 N 次
expect(fn).toHaveBeenLastCalledWith('z')
expect(fn).toHaveReturnedWith({ ok: true })
```

---

## 11. 快照

```ts
expect(value).toMatchSnapshot()                   // 写到 __snapshots__/
expect(value).toMatchInlineSnapshot()             // 写在测试文件里
expect(value).toMatchSnapshot({ id: expect.any(String) })  // 属性匹配器
```

---

## 12. 反向

任何 matcher 前面加 `.not`:

```ts
expect(x).not.toBe(2)
expect(arr).not.toContain('z')
expect(fn).not.toHaveBeenCalled()
```

---

## 13. 真实项目里 80% 的断言只有这几个

```ts
expect(x).toBe(y)
expect(obj).toEqual(...)
expect(arr).toHaveLength(n)
expect(fn).toHaveBeenCalledWith(...)
await expect(p).resolves.toEqual(...)
await expect(p).rejects.toThrow(...)
expect(() => boom()).toThrow(...)
expect(x).toMatchObject({ ... })
```

**先把这 8 个练熟,其他用到再查这张表。**
