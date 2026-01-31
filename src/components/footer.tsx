import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground text-center">
          Опрос анонимный. От{" "}
          <Link
            href="https://d1s1.com?utm_source=survey&utm_medium=footer&utm_campaign=youtube_survey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            d1s1
          </Link>
          {" "}и клуба{" "}
          <Link
            href="https://deardesigners.club?utm_source=survey&utm_medium=footer&utm_campaign=youtube_survey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            Дорогие дизайнеры
          </Link>
        </p>
      </div>
    </footer>
  );
}
