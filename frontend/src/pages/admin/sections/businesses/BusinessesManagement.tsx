import { Businesses, AllBusinesses, Categories, PendingApproval, Archived } from '.';


interface BusinessesManagementProps {
  activeTab?: string;
}

export default function BusinessesManagement({ activeTab = 'restaurants' }: BusinessesManagementProps) {
  // Route to the appropriate component based on activeTab
  switch (activeTab) {
    case 'restaurants':
    case 'businesses-all':
      return <AllBusinesses />;
    case 'businesses-categories':
      return <Categories />;
    case 'businesses-pending':
      return <PendingApproval />;
    case 'businesses-archived':
      return <Archived />;
    default:
      return <AllBusinesses />;
  }
}