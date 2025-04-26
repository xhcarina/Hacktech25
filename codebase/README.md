## Overview

This project uses the following tech stack:
- Next.js 15 (for client framework)
- React 19 (for frontend components)
- Tailwind v4 (for styling)
- Shadcn UI (for UI components library)
- Lucide Icons (for icons)
- Convex (for backend & database)
- Convex Auth (for authentication)
- Framer Motion (for animations)
- Three.js (for landing page 3D graphics)

All relevant files live in the 'src' directory.

## Setup

This project is set up already and running on a cloud environment.

To set it up yourself:

1. Clone the repository
2. Run `pnpm install` to install the dependencies
3. Run `pnpm dev` to start the development server
4. Run `npx convex dev` to start the Convex development server

Running the convex development server is critical for ensuring the backend convex functions are correctly updating.

## Environment Variables

The project is set up with project specific CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL environment variables on the client side.

The convex server has a separate set of environment variables that are accessible by the convex backend.

Currently, these variables include auth-specific keys: JWKS, JWT_PRIVATE_KEY, and SITE_URL.


# Using Authentication (Important!)

You must follow these conventions when using authentication.

## Auth is already set up.

All convex authentication functions are already set up. The auth uses email OTP and uses email OTP only.

The email OTP configuration is defined in `src/convex/auth/emailOtp.ts`. DO NOT MODIFY THIS FILE.

Other auth files you should not protect include: `src/convex/auth.config.ts` and `src/convex/auth.ts`.

## Using Convex Auth on the backend

On the `src/convex/users.ts` file, you can use the `getCurrentUser` function to get the current user's data.

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
}
```

To use this function, import this function and pass in the context object of a convex function.

```typescript
import { getCurrentUser } from "@/convex/users";

// Note: this function already exists in the `src/convex/users.ts` file.
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if(user === null) {
      return null;
    }

    // do something with the user data here

    return user;
  },
});
```

## Using Convex Auth on the frontend

Use the `useAuth` hook to get the current user's data, authentication state, and authentication actions on the frontend.

The `useAuth` hook is defined in `src/hooks/use-auth.ts`:

```typescript
// This file exists already in the `src/hooks/use-auth.ts` file.
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"


export function useAuth() {
    const { isLoading, isAuthenticated } = useConvexAuth();
    const user = useQuery(api.users.currentUser);
    const { signIn, signOut } = useAuthActions();

    return {
        isLoading,
        isAuthenticated,
        user,
        signIn,
        signOut
    }
}
```

You MUST use this hook to get user data. Never do this yourself without the hook.

To use this hook, import it and call the function.

```typescript
import { useAuth } from "@/hooks/use-auth";

const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
```

## Protected Routes

All routes are protected under the `/protected` route.

This is defined in the `src/middleware.ts` file:

```typescript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/auth"]);

// use this to protect routes. if the user is not authenticated, they will be redirected to the signin page.
const isProtectedRoute = createRouteMatcher(["/protected(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    // change this to the page you want to redirect to after sign in
    return nextjsMiddlewareRedirect(request, "/protected");
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

Do not modify the `src/middleware.ts` file.

## Auth Page

The auth page is defined in `src/app/auth/page.tsx`.


DO NOT USE THIS PAGE BY DEFAULT. Instead, you should use the `AuthButton` component defined in `src/components/auth/AuthButton.tsx`.

However, if you need to protect a route with authorization, redirect the user to the auth page.

The `AuthButton` component is a button that opens a modal for the user to sign in or sign up with the built-in email OTP.

The auth card located in `src/components/auth/AuthCard.tsx` is used to render the auth on the modal and on the Auth page.

## Using the AuthButton Component

The `AuthButton` component is defined in `src/components/auth/AuthButton.tsx`. It uses:

```typescript
interface AuthButtonProps {
  trigger?: React.ReactNode
  dashboardTrigger?: React.ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  useModal?: boolean
}
```

The button comes in two states: Unauthenticated and Authenticated. It shows "Get Started" when the user is not authenticated, and shows "Dashboard" when the user is authenticated.

Trigger and DashboardTrigger allows you to replace the default Get Started and Dashboard buttons with your own buttons.

By default, the button opens a modal. Set the useModal prop to false to redirect the user to the auth page instead.

Example: 
```tsx
<AuthButton trigger={<Button size="lg">Get Started</Button>} dashboardTrigger={<Button size="lg">Dashboard</Button>} />
```

## Authorization

You can perform authorization checks on the frontend and backend.

On the frontend, you can use the `useAuth` hook to get the current user's data and authentication state.

```tsx
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/AuthButton";

export default function ExampleAuthorizedPage() {
  const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
  
  // Handle loading state
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner className="h-12 w-12" />
        </div>
    );
  }
  
  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You need to sign in to access this content</p>
        <AuthButton />
      </div>
    );
  }
  
  // Role-based authorization check
  if (!user || user.role !== "admin") {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Access denied: Admin privileges required</p>
        </div>
    );
  }
  
  // User is authenticated and authorized
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>This is protected admin content</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};
```

When writing pages, follow the same pattern:
- Use the `useAuth` hook to get the current user's data and authentication state as well as Auth actions
- Add a loading state using a spinner that is centered on the page
- If the user is not authenticated, show the AuthButton component to sign in.
- Check for the correct user role for Authorization on the page
- Render the content on the end

## Using the UserButton Component

For authenticated users, you can use the `UserButton` component to show a dropdown menu with the user's data and sign out button.

The `UserButton` component is defined in `src/components/auth/UserButton.tsx`.

It is a round display of the user's avatar with a fallback image.

When clicked, it shows a dropdown menu with the user's email and sign out button.

You can set the size of the button by passing in the `size` prop (default is 8).

DO NOT USE THIS COMPONENT. IT IS ALREADY IMPLEMENTED IN THE `src/components/protected/Sidebar.tsx` file on the navigation bar.


# Using the Nextjs Frontend

You will be using the Nextjs frontend with React 19, Tailwind v4, and Shadcn UI.

You will be using the `src/app` folder for your pages, and `src/components` for your components.

## Instructions
- DO NOT TOUCH THE `src/app/layout.tsx` file unless you are changing the metadata. Do not touch the `ConvexAuthNextjsServerProvider` or `ConvexClientProvider` components.
- Always add "use client" to the top of your client components before any other code

## User Flow

The current user flow is as follows:
- User starts on the landing page (/): MAKE SURE THIS PAGE IS ALWAYS EDITED TO REFLECT THE APP MARKETING.
- User clicks "Get Started" and a pop up to authenticate with OTP shows up.
- After successful authentication, the user is redirected to the dashboard (/protected)
- THUS: ALL CONTENT MUST START FROM THE `/protected` ROUTE. Do not leave /protected blank.


## The Landing Page

The landing page is defined in `src/app/page.tsx` and uses components from `src/components/landing`.

Each app comes with the landing page by default on the root page.

The landing page implements the `AuthButton` component for the auth modal, and the button changes to "Dashboard" when the user is authenticated. It also implements Framer Motion for the animations and Three.js for the 3D graphics on the hero.

Here are the sections of the landing page it comes with:
- Header `src/components/landing/Header.tsx`: The top navigation bar with the logo and the AuthButton component
- HeroContent `src/components/landing/HeroContent.tsx`: The main content of the landing page hero with the Three.js 3D graphics and the AuthButton component. It contains a three js graphic located in `src/components/landing/three-js-scene.tsx`. The graphic shows a dark torus knot in a colorful background. Modify this to change the three js graphic.
- Features Section `src/components/landing/FeaturesSection.tsx`: The features section of the landing page
- Footer `src/components/landing/Footer.tsx`: The footer of the landing page with the copyright information

Remember to edit the HeroContent and FeaturesSection whenever the app marketing is updated, and remember to modify the default boilerplate content of these marketing sections.

Remember to edit the Header and Footer navigation links whenever the app navigation is updated.

## The App Dashboard and Protected Dashboard Routes

The dashboard is located in `src/app/protected/page.tsx`.

These pages are protected from `src/middleware.ts` and are only accessible to authenticated users. All /protected/* routes are protected.

The protected routes come with a shared sidebar layout configured in `src/app/protected/layout.tsx`.

It allows you to add navigation pages such as:
```tsx
  const protectedMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/protected/', icon: 'dashboard', section: 'Main' },
    { label: 'Projects', href: '/protected/projects', icon: 'folder', section: 'Main' },
    { label: 'Analytics', href: '/protected/analytics', icon: 'chart', section: 'Main' },
    { label: 'Account', href: '/protected/account', icon: 'person', section: 'User' },
    { label: 'Settings', href: '/protected/settings', icon: 'settings', section: 'User' },
    { label: 'Support', href: '/protected/support', icon: 'help_circle', section: 'Help' },
  ];

  const topItems: MenuItem[] = [
    { label: 'Discord', href: 'https://discord.gg/2gSmB9DxJW' },
  ];
```

Edit these routes in the `src/app/protected/layout.tsx` file.

The top navigation bar already contains the UserButton component, thus, you do not need to use the UserButton component anywhere else.

The sidebar menu is already implemented in `src/components/protected/Sidebar.tsx`. It is used in the `src/app/protected/layout.tsx` file to wrap all protected routes with a sidebar menu.
- It contains a mobile responsive sidebar menu
- It contains the user button on the top navigation bar
- Do not remove the crack.diy branding on the sidebar menu that attributes credit:
```tsx
{/* Credit text */}
        <div className="px-4 py-3 text-xs text-center border-t">
          Cooked on <Link href="https://crack.diy" className="underline">
            crack.diy
          </Link>
        </div>
```

- The protected route content inside of each `src/app/protected/*` page should contain a title such as:
```tsx
    <div className="container">
      <h2 className="text-xl font-bold mb-6 tracking-tight">Dashboard</h2>
      {/* Content goes here*/}
    </div>
```

## Shad CN conventions

Follow these conventions when using Shad CN components, which you should use by default.
- Remember to use "cursor-pointer" to make the element clickable
- For title text, use the "tracking-tight font-bold" class to make the text more readable
- Always make apps MOBILE RESPONSIVE. This is important
- AVOID NESTED CARDS. Try and not to nest cards, borders, components, etc. Nested cards add clutter and make the app look messy.
- AVOID SHADOWS. Avoid adding any shadows to components. stick with a thin border without the shadow.
- Avoid skeletons; instead, use the loader2 component to show a spinning loading state when loading data.

## Modifying the Primitive Shad CN Components App-wide

To implement app-wide primitive changes, you should modify the underlying shadcn primitive components located in `src/components/ui/` folder.

BE CAREFUL NOT TO BREAK THESE COMPONENTS. CHANGE AS LITTLE AS POSSIBLE WHEN EDITING.

However, make sure to modify the component itself for app-wide changes to primitive UI components and styling. Generally, try to override the default styles in-line instead of trying to modify the primitives.

## Animating with Framer Motion

You must add animations to components using Framer Motion. It is already installed and configured in the project.

To use it, import the `motion` component from `framer-motion` and use it to wrap the component you want to animate.

```tsx
import { motion } from "framer-motion";
```

### Animate Button Press
```tsx
<motion.div
        whileHover={{ scale: 1.05 }}
      >
    <Button>
        Animated Button Press
    </Button>
</motion.div>
```

### Animate On Page Load Slide In
```tsx
<motion.header 
      className="w-full py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <div className="container">
      Content
    </div>
</motion.header>
```

### Other Items to animate
- Fade in and Fade Out
- Slide in and Slide Out animations
- Rendering animations

Animate for all components, including on landing page and app pages.

## Three JS Graphics

Your app comes with three js by default.

It is used in the landing page hero: `src/components/landing/three-js-scene.tsx`.

## Colors

Configuration is defined in `src/app/globals.css`. DO NOT TOUCH THIS FILE.

Instead, you can override colors in: `src/app/colors.css`

This uses the oklch color format for tailwind v4:
```css
:root {
    --radius: 0.625rem;
    --background: oklch(0.99 0.002 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
  }
  
  .dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
  }
```

Try avoiding using colors for shad cn components (they already come with colors). However, use these color variable names when needed.

Make sure all ui components are set up to be mobile responsive and compatible with both light and dark mode.


## Switching from light mode to dark mode

By default, the theme is light mode. If the user requests dark mode, change the following:

- Add the `dark` class to the `html` tag in the `src/app/layout.tsx` file

```tsx
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
```

Change the className="light" to className="dark" as shown above in src/app/layout.tsx.

Avoid using dark mode; if you do, make sure the colors are set correctly, such as border, graph colors, etc, to use dark mode.

# Using the Convex backend

You will be implementing the convex backend. Follow your knowledge of convex and the documentation to implement the backend.

Convex documentation: https://docs.convex.dev/

## The Convex Schema

You must correctly follow the convex schema implementation.

The schema is defined in `src/convex/schema.ts`.

The schema is set up with the following defaults:

```typescript
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
)
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema({
  // default auth tables using convex auth.
  ...authTables, // do not remove or modify

  // the users table is the default users table that is brought in by the authTables
  users: defineTable({
    name: v.optional(v.string()), // name of the user. do not remove
    image: v.optional(v.string()), // image of the user. do not remove
    email: v.optional(v.string()), // email of the user. do not remove
    emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
    isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
    
    role: v.optional(roleValidator), // role of the user. do not remove
  })
    .index("email", ["email"]) // index for the email. do not remove or modify
  
  // add other tables here

  // tableName: defineTable({
  //   ...
  //   // table fields
  // }).index("by_field", ["field"])

},
{
  schemaValidation: false
});

export default schema;
```

Follow the conventions above. Remember to correctly index your tables. Do not include the `_id` and `_creationTime` fields in your queries (it is included by default for each table).


## Common Convex Mistakes To Avoid

When using convex, make sure:
- Document IDs are referenced as `_id` field, not `id`.
- Document ID types are referenced as `Id<"TableName">`, not `string`.
- Document object types are referenced as `Doc<"TableName">`.
- Keep schemaValidation to false in the schema file.
- You must correctly type your code so that it passes the type checker.
- You must handle null / undefined cases of your convex queries for both frontend and backend, or else it will throw an error that your data could be null or undefined.
- Always use the `@/folder` path, with `@/convex/folder/file.ts` syntax for importing convex files.
- This includes importing generated files like `@/convex/_generated/server`, `@/convex/_generated/api`
- Remember to import functions like useQuery, useMutation, useAction, etc. from `convex/react`
