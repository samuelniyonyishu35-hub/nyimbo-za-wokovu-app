import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function relativeTime(at: number): string {
  return formatDistanceToNow(at, { addSuffix: true, locale: fr });
}
