export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}

export function getTodayString(): string {
  return toDateString(new Date());
}

export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekDays(centerDate: Date = new Date()): { date: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const current = new Date(centerDate);
  const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon, ...
  // Calculate Monday of the current week (ISO week)
  const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  const days: { date: string; dayName: string; dayNumber: number; isToday: boolean }[] = [];
  const todayStr = getTodayString();

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toDateString(d);
    days.push({
      date: dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr
    });
  }
  return days;
}

export function getMonthMatrix(year: number, month: number) {
  // month: 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startOffset = firstDay.getDay() - 1; // Start with Monday
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = lastDay.getDate();
  const matrix: { date: string; dayNumber: number; isCurrentMonth: boolean }[][] = [];
  let currentWeek: { date: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, day);
    currentWeek.push({
      date: toDateString(prevDate),
      dayNumber: day,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    currentWeek.push({
      date: toDateString(d),
      dayNumber: day,
      isCurrentMonth: true
    });

    if (currentWeek.length === 7) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month padding
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      const nextDate = new Date(year, month + 1, nextDay);
      currentWeek.push({
        date: toDateString(nextDate),
        dayNumber: nextDay,
        isCurrentMonth: false
      });
      nextDay++;
    }
    matrix.push(currentWeek);
  }

  return matrix;
}
