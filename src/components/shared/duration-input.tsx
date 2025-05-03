'use client';

import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

type DurationInputProps = {
  defaultDays?: number;
  defaultHours?: number;
  defaultMinutes?: number;
  value?: number;
  onChange?: (totalMinutes: number) => void;
};

export default function DurationInput({
  defaultDays = 0,
  defaultHours = 0,
  defaultMinutes = 0,
  value,
  onChange,
}: DurationInputProps) {
  const { t } = useTranslation();

  const calculateTotalMinutes = (days: number, hours: number, minutes: number) => {
    return Math.max(0, days) * 24 * 60 + Math.max(0, hours) * 60 + Math.max(0, minutes);
  };

  const getDaysFromMinutes = (totalMinutes: number) => {
    return Math.floor(totalMinutes / (24 * 60));
  };

  const getHoursFromMinutes = (totalMinutes: number) => {
    return Math.floor((totalMinutes % (24 * 60)) / 60);
  };

  const getMinutesFromMinutes = (totalMinutes: number) => {
    return totalMinutes % 60;
  };

  const days = value ? getDaysFromMinutes(value) : defaultDays;
  const hours = value ? getHoursFromMinutes(value) : defaultHours;
  const minutes = value ? getMinutesFromMinutes(value) : defaultMinutes;

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <div className='flex flex-1 items-center gap-2'>
        <Input
          type='number'
          min='0'
          className='flex-1'
          value={days}
          onChange={(e) => onChange?.(calculateTotalMinutes(Number.parseInt(e.target.value) || 0, hours, minutes))}
        />
        <span>{t('common.shortDays')}</span>
      </div>
      <div className='flex flex-1 items-center gap-2'>
        <Input
          type='number'
          min='0'
          className='flex-1'
          value={hours}
          onChange={(e) => onChange?.(calculateTotalMinutes(days, Number.parseInt(e.target.value) || 0, minutes))}
        />
        <span>{t('common.shortHours')}</span>
      </div>
      <div className='flex flex-1 items-center gap-2'>
        <Input
          type='number'
          min='0'
          className='flex-1'
          value={minutes}
          onChange={(e) => onChange?.(calculateTotalMinutes(days, hours, Number.parseInt(e.target.value) || 0))}
        />
        <span>{t('common.shortMinutes')}</span>
      </div>
    </div>
  );
}
