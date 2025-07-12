/**
 * RepositoryFactory is responsible for creating instances of repositories.
 * It provides a method to create UserRepository and AuthenticationRepository based on the type.
 * This factory is used by services to get the appropriate repository instance.
 */

import { DashboardBuilderRepository } from "@dataviz/repositories/dashboard-builder/dashboard-builder.repository";

type RepositoryType = "dashboard-builder";

export class RepositoryFactory {
  /**
   * Create a repository instance based on the type.
   * @param { RepositoryType } type - The type of the repository.
   * @param [config] - Optional configuration for the repository.
   * @returns { ProductRepository } - The repository instance.
   */
  static createRepository(type: RepositoryType, config?: any) {
    switch (type) {
      case "dashboard-builder":
        return new DashboardBuilderRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
