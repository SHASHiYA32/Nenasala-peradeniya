import { ClassItem } from '@/app/types/types';

export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const checkTimeOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);

  return Math.max(sA, sB) < Math.min(eA, eB);
};

export const getConflictingClassIds = (classList: ClassItem[]): Set<string> => {
  const conflictingIds = new Set<string>();

  for (let i = 0; i < classList.length; i++) {
    for (let j = i + 1; j < classList.length; j++) {
      const classA = classList[i];
      const classB = classList[j];

      if (
        classA.date === classB.date &&
        checkTimeOverlap(classA.startTime, classA.endTime, classB.startTime, classB.endTime)
      ) {
        conflictingIds.add(classA.id);
        conflictingIds.add(classB.id);
      }
    }
  }

  return conflictingIds;
};