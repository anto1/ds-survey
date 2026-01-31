import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        <h1 className="text-4xl font-light tracking-tight">
          Design YouTube Survey
        </h1>
        <p className="text-muted-foreground text-lg">
          Help us understand what YouTube channels designers watch to stay
          inspired, learn new skills, and keep up with industry trends.
        </p>
        <Link
          href="/survey/design-youtube"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Take the survey
        </Link>
      </div>
    </main>
  );
}
