# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5509df15-bd91-41b0-a5a8-0a58f2572f65

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5509df15-bd91-41b0-a5a8-0a58f2572f65) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running TestSprite end-to-end tests

1. Make sure TestSprite MCP/CLI is installed and running on your machine.
2. Install project dependencies and start the dev server:

```sh
npm install
npm run dev
```

3. In a separate terminal run the TestSprite E2E tests:

```sh
npm run test:e2e
```

Test reports will be written to `tests/e2e/reports` by default.

### CI setup

This repo includes a GitHub Actions workflow at `.github/workflows/testsprite-e2e.yml` which:

- Checks out the code and installs dependencies
- Starts the dev server and waits for `http://localhost:8080`
- Installs the TestSprite CLI (assumes an npm package named `testsprite`)
- Runs `npm run test:e2e`

You must add the following secret to your repository for tests to run in CI:

- `TESTSPRITE_API_KEY`: your TestSprite API key

If your CI environment requires a different way to install TestSprite (not via npm), edit the workflow accordingly.

### GitLab CI setup

To run TestSprite E2E in GitLab CI, this repository includes a `.gitlab-ci.yml` pipeline that:

- Uses Node.js 18 image
- Installs dependencies with `npm ci`
- Starts the dev server and waits for `http://localhost:8080`
- Attempts to install the TestSprite CLI via `npm install -g testsprite`
- Runs `npm run test:e2e`

Add the following CI/CD variables in your GitLab project settings if required:

- `TESTSPRITE_API_KEY`: your TestSprite API key

If your organization installs TestSprite on runners differently, update `.gitlab-ci.yml` to match your runner's setup.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5509df15-bd91-41b0-a5a8-0a58f2572f65) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
