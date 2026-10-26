import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import CreateEvents from "./components/CreateEvents";
import EventCard from "./components/EventCard";
import EventDetails from "./components/EventDetails";
import Payments from "./components/Payments";
import Tickets from "./components/Tickets";
import Vendors from "./components/Vendors";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import NotFound from "./components/NotFound";


export default function App() {
  const [events, setEvents] = useState([]); // central state for all events

  return (
    <Router>
      <div className="min-vh-100">
        <Routes>
          <Route path="/" element={<Home events={events} />} />
          <Route path="/create" element={<CreateEvents setEvents={setEvents} />} />
          <Route path="/event" element={<EventCard events={events} />} />
          <Route path="/event/:id" element={<EventDetails events={events} />} />
          <Route path="/payments/:id" element={<Payments events={events} />} />
          <Route path="/ticket/:ticketId" element={<Tickets />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetpassword" element={<ForgotPassword />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>

    </Router>
  );
}
