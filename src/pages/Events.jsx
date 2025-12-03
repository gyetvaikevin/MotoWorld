import React, { useState } from "react"; // 🔧 kell a useState
import useEvents from "../hooks/events/useEvents";
import EventForm from "../components/events/EventForm";
import EventFilters from "../components/events/EventFilters";
import EventCard from "../components/events/EventCard";
import EditEventForm from "../components/events/EditEventForm";
import LoaderWrapper from "../components/common/LoaderWrapper";
import "../styles/Cards.css";
import "../styles/Events.css";

export default function Events() {
  const {
    events,
    title, setTitle,
    desc, setDesc,
    image, setImage,
    imagePreview, setImagePreview,
    stops, setStops,
    user,
    editId, setEditId,
    editTitle, setEditTitle,
    editDesc, setEditDesc,
    editImage, setEditImage,
    editImagePreview, setEditImagePreview,
    searchTerm, setSearchTerm,
    sortOption, setSortOption,
    loading, error, success,
    handleImageChange,
    handleAddEvent,
    handleUpdate,
    handleDelete,
    toggleLike,
    openRouteInMaps,
  } = useEvents();

  // 🔧 új state a locationFilter-hez
  const [locationFilter, setLocationFilter] = useState(null);

  // 🔧 helper függvény a távolság számításhoz (Haversine formula)
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Föld sugara km-ben
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 🔧 szűrés szöveg + csak start pont alapján
  const filtered = events.filter((ev) => {
    const matchesText =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.desc.toLowerCase().includes(searchTerm.toLowerCase());

    if (!locationFilter) {
      return matchesText;
    }

    // csak a start pontot nézzük (route[0] vagy stops[0])
    const start =
      (ev.route && ev.route.length > 0 && ev.route[0]) ||
      (ev.stops && ev.stops.length > 0 && ev.stops[0]) ||
      null;

    if (start && start.lat && start.lng) {
      const dist = getDistanceKm(
        locationFilter.center[0],
        locationFilter.center[1],
        start.lat,
        start.lng
      );
      return matchesText && dist <= locationFilter.radius / 1000; // m → km
    }

    return false;
  });

  const handleEditInit = (ev) => {
    setEditId(ev.id);
    setEditTitle(ev.title);
    setEditDesc(ev.desc);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditDesc("");
    setEditImage(null);
    setEditImagePreview(null);
  };

  return (
    <div className="events-container">
      <h2>Események</h2>

      <EventFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOption={sortOption}
        setSortOption={setSortOption}
        locationFilter={locationFilter}        // 🔧 átadva
        setLocationFilter={setLocationFilter}  // 🔧 átadva
      />

      {user && (
        <EventForm
          title={title}
          setTitle={setTitle}
          desc={desc}
          setDesc={setDesc}
          image={image}
          setImage={setImage}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          stops={stops}
          setStops={setStops}
          handleImageChange={handleImageChange}
          handleAddEvent={handleAddEvent}
          loading={loading}
          error={error}
          success={success}
        />
      )}

      {loading ? (
        <LoaderWrapper text="Események betöltése..." />
      ) : events.length === 0 ? (
        <LoaderWrapper text="Nincsenek események" />
      ) : filtered.length === 0 ? (
        <div className="card"><p>Nincs találat.</p></div>
      ) : (
        filtered.map((ev) =>
          editId === ev.id ? (
            <EditEventForm
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editDesc={editDesc}
              setEditDesc={setEditDesc}
              editImage={editImage}
              setEditImage={setEditImage}
              editImagePreview={editImagePreview}
              setEditImagePreview={setEditImagePreview}
              handleImageChange={handleImageChange}
              handleUpdate={handleUpdate}
              onCancel={handleCancelEdit}
            />
          ) : (
            <EventCard
              key={ev.id}
              event={ev}
              user={user}
              onEdit={handleEditInit}
              onDelete={handleDelete}
              onLike={toggleLike}
              openRouteInMaps={openRouteInMaps}
            />
          )
        )
      )}
    </div>
  );
}