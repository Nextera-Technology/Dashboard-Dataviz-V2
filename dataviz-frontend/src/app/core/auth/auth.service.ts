import { Injectable } from "@angular/core";
import { RepositoryFactory } from "@dataviz/repositories/repository.factory";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { delay, tap } from "rxjs/operators";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "operator" | "visitor";
  status?: "active" | "inactive";
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "operator" | "visitor";
}

export interface UpdateUserData {
  id: string;
  name: string;
  email: string;
  role: "operator" | "visitor";
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Static dummy users with IDs
  private readonly dummyUsers: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "operator",
      status: "active",
      lastLogin: new Date(),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      role: "visitor",
      status: "active",
      lastLogin: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "operator",
      status: "active",
      lastLogin: new Date(),
    },
    {
      id: "4",
      name: "Bob Johnson",
      email: "bob@example.com",
      password: "password123",
      role: "visitor",
      status: "inactive",
    },
  ];
  private userRepository;

  constructor() {
    this.userRepository = RepositoryFactory.createRepository("user");
    this.loadUserFromSession();
  }

  async userLogin(email, password) {
    try {
      const result = await this.userRepository?.loginUser(email, password);
      if (result?.user?._id) {
        const userData = result?.user;
        userData['role'] = 'operator'
        userData['status'] = 'active'
        this.currentUserSubject.next(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
      }
      localStorage.setItem("token", JSON.stringify(result?.accessToken));
      return result;
    } catch (error) {
      console.error("Error loading user from session:", error);
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<User> {
    const user = this.dummyUsers.find(
      (u) =>
        u.email === credentials.email &&
        u.password === credentials.password &&
        u.status === "active"
    );

    if (user) {
      // Simulate API delay
      return of(user).pipe(
        delay(1000),
        tap((user) => {
          this.setCurrentUser(user);
        })
      );
    } else {
      // Return an error observable instead of throwing
      return throwError(() => new Error("Invalid email or password"));
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    sessionStorage.clear(); // Clear any residual session data
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has operator role
   */
  isOperator(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "operator";
  }

  /**
   * Check if user has visitor role
   */
  isVisitor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "visitor";
  }

  // CRUD Operations for User Management

  /**
   * Get all users (for admin)
   */
  getAllUsers(): Observable<User[]> {
    return of(this.dummyUsers).pipe(delay(500));
  }

  /**
   * Create new user
   */
  createUser(userData: CreateUserData): Observable<User> {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      status: "active",
    };

    this.dummyUsers.push(newUser);
    return of(newUser).pipe(delay(500));
  }

  /**
   * Update user
   */
  updateUser(userData: UpdateUserData): Observable<User> {
    const index = this.dummyUsers.findIndex((u) => u.id === userData.id);
    if (index !== -1) {
      this.dummyUsers[index] = { ...this.dummyUsers[index], ...userData };
      return of(this.dummyUsers[index]).pipe(delay(500));
    }
    return throwError(() => new Error("User not found"));
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): Observable<boolean> {
    const index = this.dummyUsers.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.dummyUsers.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return throwError(() => new Error("User not found"));
  }

  /**
   * Toggle user status
   */
  toggleUserStatus(userId: string): Observable<User> {
    const user = this.dummyUsers.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === "active" ? "inactive" : "active";
      return of(user).pipe(delay(500));
    }
    return throwError(() => new Error("User not found"));
  }

  /**
   * Set current user and save to session storage
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  /**
   * Load user from session storage on app initialization
   */
  private loadUserFromSession(): void {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error("Error loading user from session:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }
}
