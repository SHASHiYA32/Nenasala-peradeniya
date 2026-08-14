'use client';

import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react'; // Import your preferred icon
import { ClassItem } from '@/app/types/types';
import ClassTimeline from '@/components/admin-LMS/classes/ClassTimeline';
import ClassSchedulerForm from '@/components/admin-LMS/classes/ClassSchedulerForm';
import ClassDetailModal from '@/components/admin-LMS/classes/ClassDetailModal';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-23');
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: '1',
      title: 'test lecture schedule',
      code: 'BM001/26.1',
      date: '2026-07-22',
      startTime: '09:00',
      endTime: '11:00',
      classType: 'online',
    },
    {
      id: '2',
      title: 'Business Management',
      code: 'BM001/26.1',
      date: '2026-07-23',
      startTime: '06:00',
      endTime: '10:00',
      classType: 'online',
    },
    {
      id: '3',
      title: 'Business Management',
      date: '2026-07-23',
      startTime: '13:30',
      endTime: '18:00',
      classType: 'in-house',
    },
  ]);

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAddClass = (newClass: ClassItem) => {
    setClasses((prev) => [...prev, newClass]);
  };

  const handleDoubleClick = (classData: ClassItem) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-full bg-white dark:bg-black p-6 px-10">
      {/* Top Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-xl">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Class Schedule
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage, schedule, and view all upcoming lectures and sessions.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Side: Timeline & Week Calendar */}
        <div className="w-full lg:w-3/4 h-full">
          <ClassTimeline
            classes={classes}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onClassDoubleClick={handleDoubleClick}
          />
        </div>

        {/* Right Side: Scheduler Form */}
        <div className="w-full lg:w-1/4 h-full">
          <ClassSchedulerForm
            existingClasses={classes}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddClass={handleAddClass}
          />
        </div>
      </div>

      <ClassDetailModal
        classData={selectedClass}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}