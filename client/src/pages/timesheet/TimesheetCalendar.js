import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import API from "../../api/api";
import moment from "moment";

const TimesheetCalendar = () => {
  const [events, setEvents] = useState([]);

  // 📡 Fetch timesheet data and convert to calendar events
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await API.get("/timesheets");
        const entries = res.data;

        const calendarEvents = entries.map((entry) => ({
          id: entry._id,
          title: entry.task?.title || "No Task",
          start: entry.startTime,
          end: entry.endTime || moment().toISOString(),
          allDay: false,
        }));

        setEvents(calendarEvents);
      } catch (err) {
        console.error("❌ Failed to fetch calendar entries", err);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="card p-2 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        height="auto"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }}
        eventClick={(info) => {
          alert(`Task: ${info.event.title}\nStart: ${info.event.start}`);
        }}
      />
    </div>
  );
};

export default TimesheetCalendar;
