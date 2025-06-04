export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isWorkshopActive(date: string): boolean {
  const workshopDate = new Date(date);
  const now = new Date();
  return workshopDate > now;
} 