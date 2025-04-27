import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import './globals.css';

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();

  // If a session exists, redirect to the protected page
  if (session) {
    redirect("/protected/");
  }

  // If no session, show sign-up and login buttons
  return (
    <main>
      <a href="/auth/login?screen_hint=signup">
        <button>Sign up</button>
      </a>
      <a href="/auth/login">
        <button>Log in</button>
      </a>
    </main>
  );
}