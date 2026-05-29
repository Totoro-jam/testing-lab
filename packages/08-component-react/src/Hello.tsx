export function Hello({ name = "World" }: { name?: string }) {
  return <p>Hello, {name}</p>;
}
