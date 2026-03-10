export class User {
  #id;
  #firstName;
  #lastName;
  #email;
  #password;
  #role;
  #isActive;

  constructor(user) {
    if (!user) {
      throw new Error("User data is required");
    }

    this.#id = user.id;
    this.#firstName = user.firstName;
    this.#lastName = user.lastName;
    this.#email = user.email;
    this.#password = user.password;
    this.#role = user.role;
    this.#isActive = user.isActive;
  }

  get id() {
    return this.#id;
  }

  get firstName() {
    return this.#firstName;
  }

  set firstName(value) {
    this.#firstName = value;
  }

  get lastName() {
    return this.#lastName;
  }

  set lastName(value) {
    this.#lastName = value;
  }

  get email() {
    return this.#email;
  }

  set email(value) {
    this.#email = value;
  }

  get password() {
    return this.#password;
  }

  set password(value) {
    this.#password = value;
  }

  get role() {
    return this.#role;
  }

  set role(value) {
    this.#role = value;
  }

  get isActive() {
    return this.#isActive;
  }

  set isActive(value) {
    this.#isActive = value;
  }

  get fullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  get apprvName() {
    return `${this.#firstName[0]}${this.#lastName[0]}`;
  }

  toJSON() {
    return {
      id: this.#id,
      firstName: this.#firstName,
      lastName: this.#lastName,
      email: this.#email,
      password: this.#password,
      role: this.#role,
      isActive: this.#isActive,
    };
  }
}
