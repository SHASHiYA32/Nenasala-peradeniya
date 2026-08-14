'use client';

import React from 'react';
import { ClassItem } from '@/app/types/types';
import { Clock, User, Video, Building2, X } from 'lucide-react';

interface ClassDetailModalProps {
  classData: ClassItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassDetailModal({ classData, isOpen, onClose }: ClassDetailModalProps) {
  if (!isOpen || !classData) return null;

  const isOnline = classData.classType === 'online';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 text-gray-800 dark:text-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isOnline
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400'
              }`}
            >
              {classData.code || 'BM001/26.1'}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{classData.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 mb-6">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <Clock className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Date & Time</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {classData.date} • {classData.startTime} - {classData.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            {isOnline ? (
              <Video className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            ) : (
              <Building2 className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            )}
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Delivery Type</p>
              <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{classData.classType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <User className="w-5 h-5 text-pink-500 dark:text-pink-400" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Course</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{classData.course || 'Business Management'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}