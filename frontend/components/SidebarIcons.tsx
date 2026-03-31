import {
  HomeIcon, ChartBarIcon, DocumentReportIcon, UserGroupIcon, AcademicCapIcon, SearchIcon, CogIcon, BellIcon, UserIcon, ShoppingCartIcon, ClipboardListIcon, CollectionIcon, LightningBoltIcon, CameraIcon, PlayIcon, MusicNoteIcon, DocumentTextIcon, InboxIcon, SupportIcon, WrenchScrewdriverIcon, AdjustmentsHorizontalIcon, ShieldCheckIcon, CurrencyDollarIcon, GlobeAltIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export const sidebarIcons: Record<string, JSX.Element> = {
  Dashboard: <HomeIcon className="w-5 h-5 inline-block mr-2" />,
  Workspace: <ClipboardListIcon className="w-5 h-5 inline-block mr-2" />,
  Reports: <DocumentReportIcon className="w-5 h-5 inline-block mr-2" />,
  Analytics: <ChartBarIcon className="w-5 h-5 inline-block mr-2" />,
  Community: <UserGroupIcon className="w-5 h-5 inline-block mr-2" />,
  Learning: <AcademicCapIcon className="w-5 h-5 inline-block mr-2" />,
  Explore: <SearchIcon className="w-5 h-5 inline-block mr-2" />,
  Tools: <WrenchScrewdriverIcon className="w-5 h-5 inline-block mr-2" />,
  Support: <SupportIcon className="w-5 h-5 inline-block mr-2" />,
  Account: <UserIcon className="w-5 h-5 inline-block mr-2" />,
  Insights: <LightningBoltIcon className="w-5 h-5 inline-block mr-2" />,
  Media: <CameraIcon className="w-5 h-5 inline-block mr-2" />,
  Notifications: <BellIcon className="w-5 h-5 inline-block mr-2" />,
  Settings: <CogIcon className="w-5 h-5 inline-block mr-2" />,
  Products: <CollectionIcon className="w-5 h-5 inline-block mr-2" />,
  Cart: <ShoppingCartIcon className="w-5 h-5 inline-block mr-2" />,
  Orders: <ClipboardListIcon className="w-5 h-5 inline-block mr-2" />,
  Profile: <UserIcon className="w-5 h-5 inline-block mr-2" />,
  Admin: <ShieldCheckIcon className="w-5 h-5 inline-block mr-2" />,
};
