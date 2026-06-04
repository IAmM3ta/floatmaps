# Real-time Location Sync for GroupRides

## How it works

FloatMaps uses Supabase Realtime to deliver live location updates during GroupRides.

When a participant calls `update_location`, the change is written to `group_ride_participants.last_location`. 
All other participants subscribed to that group ride will receive the update in real time via WebSocket.

## Frontend Implementation (Recommended)

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to live location updates for a specific group ride
function subscribeToGroupRideLocations(groupRideId: string, onUpdate: (payload: any) => void) {
  return supabase
    .channel(`group-ride-${groupRideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'group_ride_participants',
        filter: `group_ride_id=eq.${groupRideId}`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();
}

// Example usage
subscribeToGroupRideLocations('your-group-ride-id', (updatedParticipant) => {
  console.log('Participant moved:', updatedParticipant.rider_id, updatedParticipant.last_location);
  // Update your map markers here
});
```

## Enabling Realtime (One-time setup in Supabase Dashboard)

1. Go to your Supabase project
2. Navigate to **Database > Replication**
3. Enable replication on the `group_ride_participants` table
4. Select the `last_location` column (or all columns)

Alternatively, run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE group_ride_participants;
```

## Error Handling Notes

- If Realtime fails to connect, fall back to polling `get_participants` every 3-5 seconds.
- The `update_location` action already includes validation and returns clear error codes.
- Use the `get_participants` action on initial load to get current positions before subscribing to live updates.
