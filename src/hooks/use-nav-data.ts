import { FileChartColumn, LayoutDashboardIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function useNavData() {
  const { t } = useTranslation();

  const data = [
    {
      title: t('nav.dashboard'),
      url: '/',
      icon: LayoutDashboardIcon,
      isActive: true,
      items: [
        {
          title: t('nav.item1'),
          url: '/item1',
        },
        {
          title: t('nav.item2'),
          url: '/item2',
        },
        {
          title: t('nav.item3'),
          url: '/item3',
        },
        {
          title: t('nav.item4'),
          url: '/item4',
        },
      ],
    },
    {
      title: t('nav.contentManagement'),
      url: '/',
      icon: FileChartColumn,
      isActive: true,
      items: [
        {
          title: t('nav.item1'),
          url: '/item1',
        },
        {
          title: t('nav.item2'),
          url: '/item2',
        },
      ],
    },
  ];

  return data;
}
