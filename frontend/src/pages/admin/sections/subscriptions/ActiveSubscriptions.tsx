import AllSubscriptions from './AllSubscriptions';

export default function ActiveSubscriptions() {
  // This component shows only active subscriptions
  return <AllSubscriptions initialStatusFilter="active" />;
}
