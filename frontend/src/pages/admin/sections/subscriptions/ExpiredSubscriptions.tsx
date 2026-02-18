import AllSubscriptions from './AllSubscriptions';

export default function ExpiredSubscriptions() {
  // This component shows only expired subscriptions
  return <AllSubscriptions initialStatusFilter="expired" />;
}
