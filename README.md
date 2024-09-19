# Juadah Backend

Juadah is a bakery that utilizes the web as a platform for purchasing its products. This repository contains the backend for Juadah, developed using TypeScript, Express, MySQL, and Zod to ensure robust API validation and functionality.

> if you have any idea, or found some 🐛, please create new issue and we'll do some yapping there

## Table of Contents

- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Postman Collection](#postman-collection)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Technologies Used

- **TypeScript**: For type-safe development.
- **Express**: As the web framework.
- **MySQL**: For the database.
- **Zod**: For data validation and parsing.
- **Multer**: To handle upload product images process
- **Jest**: To create unit test

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/juadah-backend.git
   cd juadah-backend
   ```

2. **Install dependencies**:
   *I'm using Node v20*
   ```bash
   npm install
   ```
  
4. **Set up environment variables**: 
   You can copy the `.env.example` as `.env` file and configure it based on your machine environment:


5. **Run database migrations**:
   **This part is missing, I need your help**
   We actually need to make the migrations simpler, but for now im just doing it manually by copy and paste the SQL command that you can found in `db/init.sql` file

6. **Start the application**:
   ```bash
   npm run dev
   ```

## Running the Application

To run the app locally, use the following command:
```bash
npm run dev
```

This will start the Express server and connect to the MySQL database. Ensure you have your `.env` file correctly configured.

## Testing

Unit tests are required for each service. Tests should pass before merging any feature branch into `master` or `dev`. You can run the test suite with:

```bash
npm run test
```

Make sure that all tests pass when making any pull requests.
**Any pull request with tests that aren't passed will be rejected automatically**

### Writing Tests

1. For each service or feature you implement, write unit tests to cover all functionality.
2. Ensure tests are created with complete coverage of edge cases.

## Postman Collection

Contributors are expected to create new Postman requests for each new endpoint, and ensure that they can run automatically.

1. Update the existing Postman collection or create a new one for new API routes.
2. Configure the environment settings for Postman and automate updating the environment variables when needed.
3. Provide scripts in Postman for handling environment updates when running tests.

## Contribution Guidelines

### Simple wrap up about the difference between *feat, fix, and chore*
1. Feat
   Used when introducing new functionality or features to the codebase. This type of commit adds something new that wasn't there before
   Examples:
   - Adding a new API endpoint.
   - Implementing a new feature, such as user authentication.
   - Adding a new page or functionality to a web app.
2. Fix
   Used when addressing and resolving a bug or an issue in the code. This type of commit usually deals with a bug reported by users or discovered through testing.
   Examples:
   - Fixing a broken API endpoint.
   - Correcting a typo that causes a bug.
   - Resolving an issue where a feature is not working as expected.
3. Chore
   Used for tasks that don't change the functionality of the codebase or application. These are maintenance tasks or small updates that are not directly related to the product's features or bug fixes.
   Examples:
   - Updating documentation, like the README.
   - Updating dependencies or configuration files.
   - Refactoring code without changing its behavior.
   - Setting up tools for linting, formatting, or testing.

We welcome contributions! Here's how you can help:

1. **Fork the repository** and create a new branch:
   If you want to develop new feature, you can 👇:
   ```bash
   git checkout -b feat/<your-feature>
   git checkout -b feat/add-user-authentication
   git checkout -b feat/add-order-history-feature
   ```
   If you have some 🐛fix:
   ```bash
   git checkout -b fix/<your-fix>
   # example
   git checkout -b fix/checkout-process-error
   git checkout -b fix/user-login-bug
   ```
   Or for some chore:
   ```bash
   git checkout -b chore/update-readme
   git checkout -b chore/dependency-updates
   ```

3. **Make your changes**, ensuring the following:
   - Write unit tests for any new service.
   - All tests must pass before pushing your branch.
   - Ensure that all new or updated endpoints are added to the Postman collection.

4. **Commit your changes**: 
   - We use **Husky** and **lint-staged** to automatically lint and format the code before each commit. This process ensures that the codebase remains consistent and clean.
   - If there are any linting or formatting errors, the commit will be blocked. You can fix the issues by running:
     ```bash
     npm run fix-lint
     ```
   - Or if the command doesn't work, that mean you have to resolve that lint or formatting error manually
   - Once all issues are resolved, you can commit your changes.

5. **Submit a pull request**:
   - Once your changes are ready, submit a pull request to the `dev` or `master` branch.
   - Make sure all tests and lint checks pass.

### Commit Message Guidelines

We follow a commit message convention to maintain clarity in the project's history. The commit types include:

- `feat`: For new features.
- `fix`: For bug fixes.
- `chore`: For minor changes like updating dependencies or configuration files.

---
Let's start hacking 💻
