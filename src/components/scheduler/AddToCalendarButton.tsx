import React, { useState } from 'react';
import { Calendar as CalendarIcon, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { Trip } from '../../types';

interface AddToCalendarButtonProps {
  trip: Trip;
}

export default function AddToCalendarButton({ trip }: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Format ISO timestamp to UTC compact for iCal / Google Calendar (YYYYMMDDTHHmmssZ)
  const formatCompactUtc = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const getGoogleCalendarUrl = (): string => {
    const startCompact = formatCompactUtc(trip.startTime);
    // If no end time, default to start + 3 hours
    const endCompact = trip.endTime 
      ? formatCompactUtc(trip.endTime) 
      : formatCompactUtc(new Date(new Date(trip.startTime).getTime() + 3 * 3600000).toISOString());

    const title = encodeURIComponent(`4x4 Trail Run: ${trip.trailName} - ${trip.title}`);
    const details = encodeURIComponent(
      `${trip.description || ''}\n\n` +
      `Trail: ${trip.trailName}\n` +
      `Difficulty: ${trip.difficultyRating}\n` +
      `Comms Channel: ${trip.commsChannel}\n` +
      `Convoy Limit: ${trip.maxRigs} Rigs\n` +
      `Min Requirements: ${trip.minimumRequirements.join(', ')}\n\n` +
      `Planned via 4x4 TrailFinder Group Runs`
    );
    const location = encodeURIComponent(trip.meetingLocation);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startCompact}/${endCompact}&details=${details}&location=${location}`;
  };

  const downloadIcsFile = () => {
    const startCompact = formatCompactUtc(trip.startTime);
    const endCompact = trip.endTime 
      ? formatCompactUtc(trip.endTime) 
      : formatCompactUtc(new Date(new Date(trip.startTime).getTime() + 3 * 3600000).toISOString());
    const nowCompact = formatCompactUtc(new Date().toISOString());

    const description = (
      `${trip.description || ''}\\n\\n` +
      `Trail: ${trip.trailName}\\n` +
      `Difficulty: ${trip.difficultyRating}\\n` +
      `Comms Channel: ${trip.commsChannel}\\n` +
      `Convoy Limit: ${trip.maxRigs} Rigs\\n` +
      `Min Requirements: ${trip.minimumRequirements.join(', ')}`
    ).replace(/\n/g, '\\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//4x4 TrailFinder//Group Runs Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:trip-${trip.id}@trailfinder4x4.com`,
      `DTSTAMP:${nowCompact}`,
      `DTSTART:${startCompact}`,
      `DTEND:${endCompact}`,
      `SUMMARY:4x4 Group Run: ${trip.trailName} (${trip.title})`,
      `DESCRIPTION:${description}`,
      `LOCATION:${trip.meetingLocation}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.trailName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-run.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl border border-stone-700 text-xs font-heading font-bold shadow-sm transition-colors"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
        <span>Add to Calendar</span>
        <ChevronDown className="w-3 h-3 text-stone-400" />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-56 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl z-50 overflow-hidden py-1"
          onMouseLeave={() => setIsOpen(false)}
        >
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-stone-200 hover:bg-amber-500 hover:text-stone-950 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Calendar</span>
          </a>

          <button
            type="button"
            onClick={downloadIcsFile}
            className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-stone-200 hover:bg-amber-500 hover:text-stone-950 font-medium transition-colors border-t border-stone-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Apple / Outlook (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}
