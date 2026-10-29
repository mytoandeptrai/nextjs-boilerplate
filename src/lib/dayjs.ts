import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export function initDayjs(locale: string) {
  dayjs.locale(locale);
}

export default dayjs;
