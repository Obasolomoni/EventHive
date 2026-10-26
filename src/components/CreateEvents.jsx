
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialForm = {
  eventName: "",
  eventDate: "",
  eventTime: "",
  eventLocation: "",
  eventDescription: "",
  eventPrice: "",
  eventCapacity: "",
  eventCategory: "",
  eventImage: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#111114] px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

const labelClass = "text-sm font-medium text-white/80";

export default function CreateEvents({ setEvents }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const price = form.eventPrice === "" ? 0 : Number(form.eventPrice);
    const capacity =
      form.eventCapacity === "" ? "" : Number(form.eventCapacity);

    if (!form.eventName.trim() || !form.eventLocation.trim()) {
      setError("Please complete the required event details.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Ticket price cannot be negative.");
      return;
    }

    if (
      form.eventCapacity !== "" &&
      (!Number.isInteger(capacity) || capacity < 1)
    ) {
      setError("Capacity must be a whole number greater than zero.");
      return;
    }

    const newEvent = {
      ...form,
      id: Date.now(),
      eventName: form.eventName.trim(),
      eventLocation: form.eventLocation.trim(),
      eventDescription: form.eventDescription.trim(),
      eventPrice: price,
      eventCapacity: capacity,
      eventImage: imagePreview,
    };

    setEvents((prev) => [...prev, newEvent]);
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        {/* Page heading */}
        <div className="mb-9">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-violet-300"
          >
            <span aria-hidden="true">←</span> Go back
          </button>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
            Event management
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Create an event<span className="text-violet-400">.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
            Bring people together. Add your event details and get everything
            ready for your audience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] shadow-2xl shadow-black/20"
        >
          <div className="space-y-9 p-5 sm:p-8 lg:p-10">
            {/* Basic details */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
                  01
                </span>
                <div>
                  <h2 className="font-bold">Basic information</h2>
                  <p className="mt-1 text-xs text-white/40">
                    Tell people what your event is about.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="eventName" className={labelClass}>
                    Event name *
                  </label>
                  <input
                    id="eventName"
                    type="text"
                    name="eventName"
                    value={form.eventName}
                    onChange={handleChange}
                    placeholder="e.g. The Ultimate Music Festival"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="eventDescription" className={labelClass}>
                    Event description *
                  </label>
                  <textarea
                    id="eventDescription"
                    name="eventDescription"
                    value={form.eventDescription}
                    onChange={handleChange}
                    placeholder="What can attendees expect?"
                    rows={4}
                    className={`${inputClass} resize-y`}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="eventCategory" className={labelClass}>
                    Category *
                  </label>
                  <select
                    id="eventCategory"
                    name="eventCategory"
                    value={form.eventCategory}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                    required
                  >
                    <option value="" className="bg-[#111114]">
                      Choose a category
                    </option>
                    {["Music", "Party", "Seminar", "Wedding", "Other"].map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-[#111114]"
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Date and location */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
                  02
                </span>
                <div>
                  <h2 className="font-bold">Date and location</h2>
                  <p className="mt-1 text-xs text-white/40">
                    Help your guests plan ahead.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventDate" className={labelClass}>
                    Event date *
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    min={new Date().toLocaleDateString("en-CA")}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="eventTime" className={labelClass}>
                    Start time *
                  </label>
                  <input
                    id="eventTime"
                    type="time"
                    name="eventTime"
                    value={form.eventTime}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="eventLocation" className={labelClass}>
                    Venue or location *
                  </label>
                  <input
                    id="eventLocation"
                    type="text"
                    name="eventLocation"
                    value={form.eventLocation}
                    onChange={handleChange}
                    placeholder="Enter venue name or address"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Ticket details */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
                  03
                </span>
                <div>
                  <h2 className="font-bold">Tickets and capacity</h2>
                  <p className="mt-1 text-xs text-white/40">
                    Set your ticket price and attendee limit.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventPrice" className={labelClass}>
                    Ticket price (₦)
                  </label>
                  <input
                    id="eventPrice"
                    type="number"
                    name="eventPrice"
                    value={form.eventPrice}
                    onChange={handleChange}
                    placeholder="0 for free entry"
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-white/35">
                    Leave blank or enter 0 for a free event.
                  </p>
                </div>

                <div>
                  <label htmlFor="eventCapacity" className={labelClass}>
                    Attendee capacity
                  </label>
                  <input
                    id="eventCapacity"
                    type="number"
                    name="eventCapacity"
                    value={form.eventCapacity}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    min="1"
                    step="1"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-white/35">
                    Leave blank if there is no set limit.
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Event image */}
            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
                  04
                </span>
                <div>
                  <h2 className="font-bold">Event cover image</h2>
                  <p className="mt-1 text-xs text-white/40">
                    Give your event a strong first impression.
                  </p>
                </div>
              </div>

              <label
                htmlFor="eventImage"
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center transition duration-200 hover:border-violet-400/60 hover:bg-violet-500/5"
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-xl text-violet-300">
                  ↑
                </span>
                <span className="text-sm font-semibold">
                  Choose an event image
                </span>
                <span className="mt-2 text-xs text-white/40">
                  JPG, PNG, or other image formats · Maximum 5 MB
                </span>
                <input
                  id="eventImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {imagePreview && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={imagePreview}
                    alt="Preview of your event cover"
                    className="max-h-72 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setError("");
                    }}
                    className="absolute right-3 top-3 rounded-lg bg-black/75 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}
          </div>

          {/* Form footer */}
          <div className="flex flex-col gap-4 border-t border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
            <p className="text-xs text-white/40">
              * Required fields
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-violet-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#0f0f12]"
              >
                Save event <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-white/35">
          Your event details are currently saved in application state.
          Connect a backend to persist events between sessions.
        </p>
      </div>
    </main>
  );
}
