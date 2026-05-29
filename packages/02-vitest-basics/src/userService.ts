export interface User {
  id: number;
  name: string;
  email: string;
}

export class UserService {
  private users: Map<number, User> = new Map();
  private nextId = 1;

  create(input: Omit<User, "id">): User {
    if (!input.email.includes("@")) {
      throw new Error("Invalid email");
    }
    const user: User = { id: this.nextId++, ...input };
    this.users.set(user.id, user);
    return user;
  }

  findById(id: number): User | null {
    return this.users.get(id) ?? null;
  }

  list(): User[] {
    return [...this.users.values()];
  }

  delete(id: number): boolean {
    return this.users.delete(id);
  }

  count(): number {
    return this.users.size;
  }
}
