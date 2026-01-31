import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Опрос от</span>
            <Link
              href="https://deardesigners.club"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-muted-foreground transition-colors"
            >
              Dear Designers
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://t.me/deardesigners"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Telegram
            </Link>
            <Link
              href="https://youtube.com/@dear-designers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              YouTube
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
