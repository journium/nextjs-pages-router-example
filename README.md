# Looply Habit Tracker - Next.js (Pages Router) Example

This repository demonstrates Journium integration for **Next.js Pages Router**. Use this as a reference implementation for building your own Journium-powered applications with Next.js Pages Router.

> [!NOTE]
> If you want to use **Next.js App Router**, please refer to the [Next.js App Router example repository](https://github.com/journium/nextjs-app-router-example.git) instead.

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Journium account (sign up at [https://journium.app/signup](https://journium.app/signup))

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/journium/nextjs-pages-router-example.git
cd nextjs-pages-router-example
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Journium

1. **Sign up for a Journium account** at [https://journium.app/signup](https://journium.app/signup)

2. **Create an application named "Looply"** in your Journium dashboard

3. **Get your publishable key** from the application settings in your Journium dashboard

4. **Create a `.env.local` file** in the root of this project and add your publishable key:

```bash
NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY=your_publishable_key_here
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

To use a custom port, specify it with the `-p` flag:

```bash
npm run dev -- -p 3001
# or
yarn dev -p 3001
# or
pnpm dev -p 3001
```

Open [http://localhost:3000](http://localhost:3000) (or your custom port) in your browser to see the application running.

## Next Steps

- Explore the codebase to see how Journium is integrated
- Check out the [Journium documentation](https://journium.app/docs) for more details
- Customize this example to build your own application

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues
