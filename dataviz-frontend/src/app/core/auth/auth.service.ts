import { Injectable } from "@angular/core";
import { RepositoryFactory } from "@dataviz/repositories/repository.factory";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { delay, tap } from "rxjs/operators";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
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
  // frontend role label — will be sent as roleName to backend
  role?: string;
}

export interface UpdateUserData {
  id: string;
  name: string;
  email: string;
  role?: string;
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
    // Use repository if available to fetch real users
    if (this.userRepository?.getAllUsers) {
      // convert promise -> observable
      return new Observable<User[]>((subscriber) => {
        this.userRepository
          .getAllUsers()
          .then((users: User[]) => {
            subscriber.next(users);
            subscriber.complete();
          })
          .catch((err: any) => subscriber.error(err));
      });
    }

    return of(this.dummyUsers).pipe(delay(500));
  }

  /**
   * Create new user
   */
  createUser(userData: CreateUserData): Observable<User> {
    if (this.userRepository?.createUser) {
      return new Observable<User>((subscriber) => {
        // Prepare payload to match backend CreateUserInput: firstName, lastName, roleName (or userTypeIds)
        const parts = (userData.name || '').split(' ');
        const firstName = parts.shift() || '';
        const lastName = parts.join(' ') || '';

        const payload: any = {
          firstName,
          lastName,
          email: userData.email,
          password: userData.password,
          name: `${firstName}${lastName ? ' ' + lastName : ''}`.trim(),
        };

        // send role label as roleName (backend accepts roleName); do not send `role` field
        // Resolve userTypeIds by querying available user types, then create
        if (userData.role && this.userRepository?.getAllUserTypes) {
          this.userRepository.getAllUserTypes()
            .then((types: any[]) => {
              const match = types.find(t => (t.roleName || '').toLowerCase() === (userData.role || '').toLowerCase());
              if (match) {
                payload.userTypeIds = [match.id];
                payload.roleName = match.roleName || userData.role;
              } else if (types.length > 0) {
                // fallback to first available type if exact match not found
                payload.userTypeIds = [types[0].id];
                payload.roleName = types[0].roleName || userData.role; // keep roleName too
              }

              return this.userRepository.createUser(payload);
            })
            .then((res: any) => {
              const created = res?.createUser || res || {};
              subscriber.next({ id: created._id || created.id || Date.now().toString(), name: `${firstName}${lastName ? ' ' + lastName : ''}`.trim(), email: userData.email, role: userData.role || 'visitor', password: userData.password, status: 'active' } as User);
              subscriber.complete();
            })
            .catch((err: any) => subscriber.error(err));
        } else {
          if (userData.role) payload.roleName = userData.role;
          this.userRepository
            .createUser(payload)
            .then((res: any) => {
              const created = res?.createUser || res || {};
              subscriber.next({ id: created._id || created.id || Date.now().toString(), name: `${firstName}${lastName ? ' ' + lastName : ''}`.trim(), email: userData.email, role: userData.role || 'visitor', password: userData.password, status: 'active' } as User);
              subscriber.complete();
            })
            .catch((err: any) => subscriber.error(err));
        }
      });
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || 'visitor',
      status: "active",
    };

    this.dummyUsers.push(newUser);
    return of(newUser).pipe(delay(500));
  }

  /**
   * Update user
   */
  updateUser(userData: UpdateUserData): Observable<User> {
    if (this.userRepository?.updateUser) {
      return new Observable<User>((subscriber) => {
        // Prepare payload similar to createUser: firstName, lastName, name, email
        const parts = (userData.name || '').split(' ');
        const firstName = parts.shift() || '';
        const lastName = parts.join(' ') || '';
        const payload: any = {
          firstName,
          lastName,
          name: `${firstName}${lastName ? ' ' + lastName : ''}`.trim(),
          email: userData.email,
        };

        // Resolve userTypeIds if role provided
        const doUpdate = (resolvedPayload: any) => {
          return this.userRepository.updateUser(userData.id, resolvedPayload);
        };

        if (userData.role && this.userRepository?.getAllUserTypes) {
          this.userRepository.getAllUserTypes()
            .then((types: any[]) => {
              const match = types.find(t => (t.roleName || '').toLowerCase() === (userData.role || '').toLowerCase());
              if (match) {
                payload.userTypeIds = [match.id];
                payload.roleName = match.roleName || userData.role;
              }
              return doUpdate(payload);
            })
            .then((res: any) => {
              subscriber.next({ ...userData } as any);
              subscriber.complete();
            })
            .catch((err: any) => subscriber.error(err));
        } else {
          doUpdate(payload)
            .then((res: any) => {
              subscriber.next({ ...userData } as any);
              subscriber.complete();
            })
            .catch((err: any) => subscriber.error(err));
        }
      });
    }

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
    if (this.userRepository?.deleteUser) {
      return new Observable<boolean>((subscriber) => {
        this.userRepository
          .deleteUser(userId)
          .then(() => {
            subscriber.next(true);
            subscriber.complete();
          })
          .catch((err: any) => subscriber.error(err));
      });
    }

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
    if (this.userRepository?.toggleUserStatus) {
      return new Observable<User>((subscriber) => {
        this.userRepository
          .toggleUserStatus(userId)
          .then((res: any) => {
            subscriber.next(res);
            subscriber.complete();
          })
          .catch((err: any) => subscriber.error(err));
      });
    }

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
