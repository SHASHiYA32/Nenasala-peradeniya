"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { ClassItem } from "@/app/types/types";
import { getConflictingClassIds, checkTimeOverlap } from "@/lib/timeUtils";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  AlertCircle,
} from "lucide-react";

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

function calculateLayoutForDay(dayClasses: ClassItem[]) {
  const sorted = [...dayClasses].sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  const groups: ClassItem[][] = [];

  sorted.forEach((item) => {
    let placed = false;
    for (const group of groups) {
      const hasOverlap = group.some((gItem) =>
        checkTimeOverlap(
          item.startTime,
          item.endTime,
          gItem.startTime,
          gItem.endTime
        )
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

  const layoutMap = new Map<
    string,
    { widthPct: number; leftPct: number; colIndex: number }
  >();

  groups.forEach((group) => {
    const columns: ClassItem[][] = [];

    group.forEach((item) => {
      let colIdx = 0;
      while (
        columns[colIdx] &&
        columns[colIdx].some((c) =>
          checkTimeOverlap(
            item.startTime,
            item.endTime,
            c.startTime,
            c.endTime
          )
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
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  // 1. ALWAYS focus today's date on initial component load/mount
  useEffect(() => {
    onDateChange(todayISO);
  }, []);

  // 2. Handle viewport resize detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 3. Scroll to current time or START_HOUR on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const targetHour = Math.max(currentHour - 1, START_HOUR);
      const scrollOffset = (targetHour - START_HOUR) * ROW_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollOffset;
    }
  }, []);

  const conflictingClassIds = useMemo(
    () => getConflictingClassIds(classes),
    [classes]
  );

  const weekDays = useMemo(() => {
    const baseDate = new Date(selectedDate || todayISO);
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

  const navigateDate = (amount: number, unit: "day" | "week" = "week") => {
    const d = new Date(selectedDate || todayISO);
    if (unit === "day") {
      d.setDate(d.getDate() + amount);
    } else {
      d.setDate(d.getDate() + amount * 7);
    }
    onDateChange(d.toISOString().split("T")[0]);
  };

  const activeDaysToDisplay = isMobile
    ? weekDays.filter((d) => d.fullDate === selectedDate)
    : weekDays;

  return (
    <div className="w-full bg-white dark:bg-amber-200/5 rounded-2xl border border-gray-200 dark:border-amber-800/10 shadow-sm flex flex-col h-full overflow-hidden text-gray-800 dark:text-gray-100">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-amber-800/10">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => navigateDate(-1, isMobile ? "day" : "week")}
            className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateDate(1, isMobile ? "day" : "week")}
            className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 transition"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
            {new Date(selectedDate || todayISO).toLocaleDateString("en-US", {
              month: "short",
              day: isMobile ? "numeric" : undefined,
              year: "numeric",
            })}
          </h2>
          {!isMobile && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Week of {weekDays[0].dayName} {weekDays[0].dayNumber} -{" "}
              {weekDays[6].dayName} {weekDays[6].dayNumber}
            </p>
          )}
        </div>

        <button
          onClick={() => onDateChange(todayISO)}
          className="px-2.5 py-1.5 text-xs font-semibold bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 rounded-lg transition"
        >
          Today
        </button>
      </div>

      {/* Days Header Row */}
      <div className="border-b border-gray-200 dark:border-amber-800/10 bg-gray-50/50 dark:bg-amber-900/10 flex">
        {/* Time Column Placeholder Header */}
        <div className="w-16 md:w-20 shrink-0 border-r border-gray-200 dark:border-amber-800/10 flex items-center justify-center text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 select-none">
          TIME
        </div>

        {/* Days Header Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-7 divide-x divide-gray-200 dark:divide-amber-800/10">
          {activeDaysToDisplay.map((day) => (
            <button
              key={day.fullDate}
              onClick={() => onDateChange(day.fullDate)}
              className={`py-2 px-1 text-center transition flex flex-col items-center justify-center ${
                day.isToday
                  ? "bg-amber-500 text-white dark:bg-amber-600 font-bold"
                  : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold">
                {day.dayName}
              </span>
              <span className="text-sm font-bold leading-none mt-1">
                {day.dayNumber}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Scroll Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <div
          className="flex relative"
          style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}
        >
          {/* Time Labels Column */}
          <div className="w-16 md:w-20 shrink-0 border-r border-gray-200 dark:border-amber-800/10 flex flex-col select-none bg-gray-50/30 dark:bg-zinc-950/20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: `${ROW_HEIGHT}px` }}
                className="border-b border-gray-100 dark:border-amber-800/10 p-1 md:p-2 text-gray-400 dark:text-gray-500 font-mono text-[10px] md:text-xs flex items-start justify-center"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Day Columns Body */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-7 divide-x divide-gray-100 dark:divide-amber-800/10 relative">
            {activeDaysToDisplay.map((day) => {
              const dayClasses = classes.filter(
                (c) => c.date === day.fullDate
              );
              const layoutMap = calculateLayoutForDay(dayClasses);

              return (
                <div
                  key={day.fullDate}
                  className={`relative ${
                    day.isToday ? "bg-amber-500/5 dark:bg-amber-950/10" : ""
                  }`}
                >
                  {/* Background Grid Lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${ROW_HEIGHT}px` }}
                      className="border-b border-gray-100 dark:border-amber-800/10"
                    />
                  ))}

                  {/* Positioned Cards */}
                  {dayClasses.map((item) => {
                    const isConflict = conflictingClassIds.has(item.id);
                    const isOnline = item.classType === "online";

                    const startMinutes = parseTimeToMinutes(item.startTime);
                    const endMinutes = parseTimeToMinutes(item.endTime);
                    const gridStartMinutes = START_HOUR * 60;

                    const top =
                      ((startMinutes - gridStartMinutes) / 60) * ROW_HEIGHT;
                    const duration = endMinutes - startMinutes;
                    const height = Math.max(
                      (duration / 60) * ROW_HEIGHT,
                      32
                    );

                    const layout = layoutMap.get(item.id) || {
                      widthPct: 100,
                      leftPct: 0,
                    };

                    return (
                      <div
                        key={item.id}
                        onClick={() => isMobile && onClassDoubleClick(item)}
                        onDoubleClick={() =>
                          !isMobile && onClassDoubleClick(item)
                        }
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${layout.leftPct}% + 1px)`,
                          width: `calc(${layout.widthPct}% - 2px)`,
                        }}
                        className={`group absolute p-1.5 md:p-2 rounded-lg cursor-pointer transition-all duration-200 ease-out shadow-sm text-white overflow-hidden z-10 flex flex-col justify-between hover:!z-50 hover:!w-full hover:!left-0 hover:shadow-2xl ${
                          isConflict
                            ? isOnline
                              ? "bg-blue-600 ring-2 ring-blue-400"
                              : "bg-pink-600 ring-2 ring-pink-400"
                            : isOnline
                            ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600"
                            : "bg-pink-500 hover:bg-pink-600 dark:bg-pink-600"
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
    </div>
  );
}