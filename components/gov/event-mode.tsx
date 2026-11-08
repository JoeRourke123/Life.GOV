/**
 * Event mode — docs/design/SYSTEM.md §4/§6.
 * When a market event is live, GovHeader crossfades to red-dark and the meta reads the event name.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface EventMode {
  active: boolean;
  eventName: string | null;
  setEvent: (name: string | null) => void;
}

const EventModeContext = createContext<EventMode | null>(null);

export function EventModeProvider({ children }: { children: ReactNode }) {
  const [eventName, setEventName] = useState<string | null>(null);
  const value = useMemo<EventMode>(
    () => ({ active: eventName !== null, eventName, setEvent: setEventName }),
    [eventName],
  );
  return <EventModeContext.Provider value={value}>{children}</EventModeContext.Provider>;
}

export function useEventMode(): EventMode {
  const ctx = useContext(EventModeContext);
  if (!ctx) throw new Error('useEventMode must be used inside EventModeProvider');
  return ctx;
}
