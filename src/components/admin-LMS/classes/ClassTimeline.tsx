"use client";

import React, { useMemo } from "react";
import { ClassItem } from "@/app/types/types";
import { getConflictingClassIds, checkTimeOverlap } from "@/lib/timeUtils";
import { ChevronLeft, ChevronRight, Video, MapPin, AlertCircle } from "lucide-react";

interface ClassTimelineProps {
  classes: ClassItem[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onClassDoubleClick: (classData: ClassItem) => void;
}

const START_HOUR = 6; 
const END_HOUR = 24; 
const ROW_HEIGHT = 60; 

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => `${String(i + START_HOUR).padStart(2, "0")}:00`
);

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

// Compute overlapping sub-columns for items within a single day
function calculateLayoutForDay(dayClasses: ClassItem[]) {
  const sorted = [...dayClasses].sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  const groups: ClassItem[][] = [];

  sorted.forEach((item) => {
    let placed = false;
    for (const group of groups) {
      const hasOverlap = group.some((gItem) =>
        checkTimeOverlap(item.startTime, item.endTime, gItem.startTime, gItem.endTime)
      );
      if (hasOverlap) {
        group.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([item]);
    }
  });

  const layoutMap = new Map<string, { widthPct: number; leftPct: number; colIndex: number }>();

  groups.forEach((group) => {
    const columns: ClassItem[][] = [];

    group.forEach((item) => {
      let colIdx = 0;
      while (
        columns[colIdx] &&
        columns[colIdx].some((c) =>
          checkTimeOverlap(item.startTime, item.endTime, c.startTime, c.endTime)
        )
      ) {
        colIdx++;
      }
      if (!columns[colIdx]) columns[colIdx] = [];
      columns[colIdx].push(item);
    });

    const totalCols = columns.length;
    columns.forEach((colItems, colIdx) => {
      colItems.forEach((item) => {
        layoutMap.set(item.id, {
          widthPct: 100 / totalCols,
          leftPct: (100 / totalCols) * colIdx,
          colIndex: colIdx,
        });
      });
    });
  });

  return layoutMap;
}

export default function ClassTimeline({
  classes,
  selectedDate,
  onDateChange,
  onClassDoubleClick,
}: ClassTimelineProps) {
  const conflictingClassIds = useMemo(
    () => getConflictingClassIds(classes),
    [classes]
  );

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  const weekDays = useMemo(() => {
    const baseDate = new Date(selectedDate);
    const dayOfWeek = baseDate.getDay();
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const isoDate = d.toISOString().split("T")[0];
      return {
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        fullDate: isoDate,
        isToday: isoDate === todayISO,
        isSelected: isoDate === selectedDate,
      };
    });
  }, [selectedDate, todayISO]);

  return (
    <div className="w-full bg-white dark:bg-amber-200/5 rounded-2xl border border-gray-200 dark:border-amber-800/10 shadow-sm flex flex-col h-full overflow-hidden text-gray-800 dark:text-gray-100">
      {/* Header Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-amber-800/10">
        <button
          onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 7);
            onDateChange(d.toISOString().split("T")[0]);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Week of {weekDays[0].dayName} {weekDays[0].dayNumber} -{" "}
            {weekDays[6].dayName} {weekDays[6].dayNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDateChange(todayISO)}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-200 dark:bg-amber-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 7);
              onDateChange(d.toISOString().split("T")[0]);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-amber-800/10 bg-gray-50/50 dark:bg-amber-900/10 text-center text-xs text-gray-500 dark:text-gray-400 py-2">
        <div className="font-semibold text-gray-400 dark:text-gray-500">
          Time
        </div>
        {weekDays.map((day) => (
          <div
            key={day.fullDate}
            className={`cursor-pointer transition py-1 rounded-xl ${
              day.isToday
                ? "bg-amber-200 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                : ""
            }`}
            onClick={() => onDateChange(day.fullDate)}
          >
            <div>{day.dayName}</div>
            <div
              className={`text-base font-bold ${
                day.isToday
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="grid grid-cols-8 relative" style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}>
          
          {/* Time Labels Column */}
          <div className="border-r border-gray-100 dark:border-amber-800/10 flex flex-col">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${ROW_HEIGHT}px` }}
                className="border-b border-gray-100 dark:border-amber-800/10 p-2 text-gray-400 dark:text-gray-500 font-mono text-xs flex items-start justify-center"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Day Columns Grid */}
          {weekDays.map((day) => {
            const dayClasses = classes.filter((c) => c.date === day.fullDate);
            const layoutMap = calculateLayoutForDay(dayClasses);

            return (
              <div
                key={day.fullDate}
                className={`relative border-r border-gray-100 dark:border-amber-800/10 ${
                  day.isToday ? "bg-amber-200/10 dark:bg-amber-950/10" : ""
                }`}
              >
                {/* Background Hour Lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${ROW_HEIGHT}px` }}
                    className="border-b border-gray-100 dark:border-amber-800/10"
                  />
                ))}

                {/* Positioned Class Blocks */}
                {dayClasses.map((item) => {
                  const isConflict = conflictingClassIds.has(item.id);
                  const isOnline = item.classType === "online";

                  const startMinutes = parseTimeToMinutes(item.startTime);
                  const endMinutes = parseTimeToMinutes(item.endTime);
                  const gridStartMinutes = START_HOUR * 60;

                  const top = ((startMinutes - gridStartMinutes) / 60) * ROW_HEIGHT;
                  const duration = endMinutes - startMinutes;
                  const height = Math.max((duration / 60) * ROW_HEIGHT, 26);

                  const layout = layoutMap.get(item.id) || { widthPct: 100, leftPct: 0 };

                  return (
                    <div
                      key={item.id}
                      onDoubleClick={() => onClassDoubleClick(item)}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(${layout.leftPct}% + 1px)`,
                        width: `calc(${layout.widthPct}% - 2px)`,
                      }}
                      className={`group absolute p-1.5 rounded-lg cursor-pointer transition-all duration-200 ease-out shadow-sm text-white overflow-hidden z-10 flex flex-col justify-between hover:!left-[1px] hover:!w-[calc(100%-2px)] hover:z-50 hover:shadow-2xl ${
                        isConflict
                          ? isOnline
                            ? "bg-blue-600 ring-2 ring-blue-400"
                            : "bg-pink-600 ring-2 ring-pink-400"
                          : isOnline
                          ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                          : "bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-xs leading-tight truncate group-hover:whitespace-normal">
                            {item.title}
                          </p>
                          {isConflict && (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] opacity-90 font-medium mt-0.5">
                          {item.startTime} - {item.endTime}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider opacity-90 mt-1">
                        {isOnline ? (
                          <>
                            <Video className="w-3 h-3 shrink-0" /> ONLINE
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3 shrink-0" /> INHOUSE
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}