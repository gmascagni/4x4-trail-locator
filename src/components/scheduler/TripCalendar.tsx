import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Users, 
  Radio, 
  Flame, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Trip, TripDifficulty } from '../../types';

interface TripCalendarProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onOpenPlanRunModal: () => void;
}

const DIFFICULTY_COLORS: Record<TripDifficulty, { bg: string; border: string; text: string }> = {
  Easy: { bg: '#16a34a', border: '#15803d', text: '#ffffff' },
  Moderate: { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff' },
  Hard: { bg: '#ea580c', border: '#c2410c', text: '#ffffff' },
  Extreme: { bg: '#dc2626', border: '#b91c1c', text: '#ffffff' }
};

export default function TripCalendar({
  trips,
  onSelectTrip,
  onOpenPlanRunModal
}: TripCalendarProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter trips
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      if (selectedDifficulty !== 'all' && t.difficultyRating !== selectedDifficulty) {
        return false;
      }
      if (!showCompleted && (t.status === 'Completed' || t.status === 'Cancelled')) {
        return false;
      }
      return true;
    });
  }, [trips, selectedDifficulty, showCompleted]);

  // Format events for FullCalendar
  const events = useMemo(() => {
    return filteredTrips.map((trip) => {
      const colors = DIFFICULTY_COLORS[trip.difficultyRating] || DIFFICULTY_COLORS.Moderate;
      return {
        id: trip.id,
        title: `${trip.trailName}: ${trip.title}`,
        start: trip.startTime,
        end: trip.endTime || trip.startTime,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: { trip }
      };
    });
  }, [filteredTrips]);

  const handleEventClick = (clickInfo: any) => {
    const trip = clickInfo.event.extendedProps.trip as Trip;
    if (trip) {
      onSelectTrip(trip);
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Control Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-heading font-black text-stone-100">
              Community Trail Runs & Convoy Schedule
            </h2>
          </div>
          <p className="text-xs text-stone-400 font-mono">
            Click any scheduled event to inspect rendezvous points, radio channels, and RSVP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPlanRunModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a Run</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Legend */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setSelectedDifficulty('all')}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors ${
              selectedDifficulty === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            All Ratings ({trips.length})
          </button>

          {(['Easy', 'Moderate', 'Hard', 'Extreme'] as TripDifficulty[]).map((d) => {
            const count = trips.filter(t => t.difficultyRating === d).length;
            const colors = DIFFICULTY_COLORS[d];
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-colors ${
                  selectedDifficulty === d
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors.bg }}
                />
                <span>{d} ({count})</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-stone-400 font-mono text-[11px] cursor-pointer hover:text-stone-200">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded border-stone-700 text-amber-500 focus:ring-0"
          />
          <span>Include Completed Runs</span>
        </label>
      </div>

      {/* FullCalendar Box */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden calendar-dark-theme">
        <FullCalendar
          plugins={[dayGridPlugin as any, timeGridPlugin as any, interactionPlugin as any]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>

      {/* Styles for Calendar Dark Theme Customization */}
      <style>{`
        .calendar-dark-theme .fc {
          --fc-border-color: #292524;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #1c1917;
          --fc-list-event-hover-bg-color: #292524;
          font-family: inherit;
          color: #f5f5f4;
        }
        .calendar-dark-theme .fc .fc-toolbar-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #f5f5f4;
        }
        .calendar-dark-theme .fc .fc-button-primary {
          background-color: #292524;
          border-color: #44403c;
          color: #f5f5f4;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 0.5rem;
          padding: 0.4rem 0.75rem;
          text-transform: capitalize;
        }
        .calendar-dark-theme .fc .fc-button-primary:hover {
          background-color: #44403c;
          border-color: #57534e;
        }
        .calendar-dark-theme .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #ea580c;
          border-color: #ea580c;
          color: #0c0a09;
        }
        .calendar-dark-theme .fc .fc-col-header-cell {
          background-color: #1c1917;
          padding: 8px 0;
          font-size: 0.75rem;
          font-family: monospace;
          color: #a8a29e;
        }
        .calendar-dark-theme .fc .fc-daygrid-day-number {
          font-size: 0.75rem;
          font-family: monospace;
          color: #a8a29e;
          padding: 4px 6px;
        }
        .calendar-dark-theme .fc .fc-day-today {
          background: rgba(234, 88, 12, 0.08) !important;
        }
        .calendar-dark-theme .fc-event {
          cursor: pointer;
          border-radius: 6px;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 700;
          transition: transform 0.15s ease;
        }
        .calendar-dark-theme .fc-event:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
}
