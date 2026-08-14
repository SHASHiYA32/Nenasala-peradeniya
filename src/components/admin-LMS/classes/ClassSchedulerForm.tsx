'use client';

import React, { useState, useMemo, FormEvent } from 'react';
import { ClassItem, NewClassInput } from '@/app/types/types';
import { checkTimeOverlap } from '@/lib/timeUtils';
import { Calendar, Video, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClassSchedulerFormProps {
  existingClasses: ClassItem[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddClass: (newClass: ClassItem) => void;
}

export default function ClassSchedulerForm({
  existingClasses,
  selectedDate,
  onDateChange,
  onAddClass,
}: ClassSchedulerFormProps) {
  const [formData, setFormData] = useState<NewClassInput>({
    title: '',
    code: 'BM001/26.1',
    instructor: '',
    room: '',
    date: selectedDate,
    startTime: '09:00',
    endTime: '17:00',
    classType: 'online',
    intake: 'KANDY/TEST/BM001/26.1',
    program: 'Test',
    course: 'Bussiness Management',
  });

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const conflict = useMemo(() => {
    if (!formData.startTime || !formData.endTime || !formData.date) return null;

    return existingClasses.find(
      (item) =>
        item.date === formData.date &&
        checkTimeOverlap(formData.startTime, formData.endTime, item.startTime, item.endTime)
    );
  }, [formData, existingClasses]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title) return;

    if (conflict) {
      toast.warning('Schedule Overlap', {
        description: 'Class overlaps with existing schedule. It will be shown side-by-side in the timeline.',
      });
    } else {
      toast.success('Class scheduled successfully!');
    }

    onAddClass({ ...formData, id: Date.now().toString() });
    setFormData((prev) => ({
      ...prev,
      title: '',
    }));
  };

  return (
    <Card className="w-full flex flex-col justify-between h-full overflow-y-auto text-xs p-5">
      <div>
        <CardHeader className="p-0 mb-4 flex-row items-center gap-2 space-y-0">
          <Calendar className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-base font-bold">Schedule Your Class</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Intake Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="intake" className="text-xs font-semibold">
                Intake
              </Label>
              <Select
                value={formData.intake}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, intake: val }))}
              >
                <SelectTrigger id="intake" className="w-full text-xs">
                  <SelectValue placeholder="Select Intake" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KANDY/TEST/BM001/26.1" className="text-xs">
                    KANDY/TEST/BM001/26.1
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Program Details Card */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl relative space-y-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs">{formData.intake}</span>
                <Badge variant="secondary" className="text-[10px] bg-amber-200 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0.5">
                  WEEK
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px]">Year: 2026 | Intake: 1</p>
              <p className="text-muted-foreground text-[11px]">Program: {formData.program}</p>
              <p className="font-semibold text-[11px]">Course: {formData.course}</p>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold">
                Select Date & Time
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, date: e.target.value }));
                  onDateChange(e.target.value);
                }}
                className="text-xs"
              />
            </div>

            {/* Time Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-[11px] font-medium text-muted-foreground">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-[11px] font-medium text-muted-foreground">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Class Description / Title */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Class Description
              </Label>
              <Textarea
                id="description"
                rows={2}
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Example: Server-side scripting with Node.js..."
                className="text-xs resize-none"
              />
            </div>

            {/* Class Type Radio Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Class Type</Label>
              <RadioGroup
                value={formData.classType}
                onValueChange={(val: 'online' | 'in-house') =>
                  setFormData((prev) => ({ ...prev, classType: val }))
                }
                className="flex items-center gap-4 pt-1"
              >
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="online" id="type-online" />
                  <Label htmlFor="type-online" className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <Video className="w-3.5 h-3.5 text-amber-500" /> Online
                  </Label>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="in-house" id="type-in-house" />
                  <Label htmlFor="type-in-house" className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" /> In-house
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              className="w-full font-bold mt-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {conflict ? 'Schedule Class (With Overlap)' : 'Schedule Class'}
            </Button>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}