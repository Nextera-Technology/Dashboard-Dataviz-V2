/**
 * RepositoryFactory is responsible for creating instances of repositories.
 * It provides a method to create UserRepository and AuthenticationRepository based on the type.
 * This factory is used by services to get the appropriate repository instance.
 */

import { DashboardBuilderRepository } from "@dataviz/repositories/dashboard-builder/dashboard-builder.repository";
import { UsersRepository } from "./users/users.repository";

type RepositoryType = "dashboard-builder" | "user";

export class RepositoryFactory {
  /**
   * Create a repository instance based on the type.
   * @param { RepositoryType } type - The type of the repository.
   * @param [config] - Optional configuration for the repository.
   * @returns { ProductRepository } - The repository instance.
   */
  static createRepository(type: RepositoryType | UsersRepository, config?: any) {
    switch (type) {
      case "dashboard-builder":
        return new DashboardBuilderRepository();
      case "user":
        return new UsersRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
