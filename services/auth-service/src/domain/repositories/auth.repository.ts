import type { UserEntity } from "../entities/user.entity.js";

export interface AuthRepository {
  findByEmail(email: string): Promise<(UserEntity & { passwordHash: string }) | null>;
  findById(id: string): Promise<UserEntity | null>;
}
