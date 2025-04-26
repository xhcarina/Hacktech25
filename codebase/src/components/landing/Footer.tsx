import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-center mb-4">
          <Link href="https://crack.diy" className="text-2xl font-serif font-extrabold">
            crack.diy
          </Link>
        </div>
        <p className="text-center text-sm text-foreground/50">
          © {new Date().getFullYear()} crack.diy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

