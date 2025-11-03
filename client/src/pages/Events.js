// src/pages/Events.js
import React, { useState, useEffect, useContext, useCallback } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import AuthContext from "../context/AuthContext";
import API from "../api/api";

import AddEventModal from "../components/AddEventModal";
import EventDetailModal from "../components/EventDetailModal";
import EditEventModal from "../components/EditEventModal";

const Events = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pickedDate, setPickedDate] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Convert 12hr to 24hr time for calendar
  function to24(time) {
    if (!time) return "09:00";
    const [t, mod] = time.split(" ");
    let [h, m] = t.split(":").map(Number);
    if (mod === "PM" && h < 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await API.get("/events");
      setEvents(
        data.map((event) => ({
          id: event._id,
          title: event.title,
          start: `${event.startDate}T${to24(event.startTime)}`,
          end: `${event.endDate}T${to24(event.endTime)}`,
          color: event.color || "#0d6efd",
          extendedProps: {
            description: event.description,
            assignedTo: event.assignedTo,
            location: event.location,
            status: event.status,
            eventLink: event.eventLink,
            filePath: event.filePath,
            host: event.host,
            client: event.client,
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching events", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateClick = (arg) => {
    if (user?.role === "admin") {
      setPickedDate(arg.dateStr);
      setShowModal(true);
    }
  };

  const handleEventClick = (e) => {
    setSelectedEvent(e.event);
    setShowDetails(true);
    setShowEdit(false);
  };

  const deleteEvent = async () => {
    await API.delete(`/events/${selectedEvent.id}`);
    setShowDetails(false);
    fetchEvents();
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Events Calendar</h4>

        {user?.role === "admin" && (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <i className="fa fa-plus me-1" /> Add Event
          </button>
        )}
      </div>

      <div className="card shadow-sm p-3">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          height="75vh"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        show={user?.role === "admin" && showModal}
        onClose={() => {
          setShowModal(false);
          setPickedDate(null);
        }}
        onSaved={fetchEvents}
        defaultDate={pickedDate}
      />

      {/* Event Details Modal */}
      <EventDetailModal
        show={showDetails}
        event={selectedEvent}
        onClose={() => setShowDetails(false)}
        onDelete={deleteEvent}
        isAdmin={user?.role === "admin"}
        onEdit={() => {
          setShowDetails(false);
          setShowEdit(true);
        }}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        show={showEdit}
        event={selectedEvent}
        onClose={() => setShowEdit(false)}
        onUpdated={fetchEvents}
      />
    </div>
  );
};

export default Events;
