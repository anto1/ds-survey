"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addChannelSuggestion, type Channel } from "@/actions/channels";

type Props = {
  onChannelAdded: (channel: Channel) => void;
};

export function AddChannelDialog({ onChannelAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addChannelSuggestion(formData);

      if (result.success && result.channel) {
        onChannelAdded(result.channel);
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error || "Failed to add channel");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить канал
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Предложить канал</DialogTitle>
          <DialogDescription>
            Добавьте YouTube-канал, которого нет в списке. Он будет
            отмечен как ожидающий модерации.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название канала *</Label>
              <Input
                id="name"
                name="name"
                placeholder="например, The Futur"
                required
                minLength={2}
                maxLength={80}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">Ссылка на YouTube</Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/@channel"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Комментарий (необязательно)</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Почему этот канал полезен?"
                rows={2}
                maxLength={500}
                disabled={isPending}
              />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
