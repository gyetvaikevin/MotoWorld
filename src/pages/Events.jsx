// src/pages/Events.jsx
import React from "react";
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

  const filtered = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "dateDesc")
      return b.createdAt?.seconds - a.createdAt?.seconds;
    if (sortOption === "dateAsc")
      return a.createdAt?.seconds - b.createdAt?.seconds;
    if (sortOption === "likesDesc")
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    if (sortOption === "likesAsc")
      return (a.likes?.length || 0) - (b.likes?.length || 0);
    return 0;
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
      ) : sorted.length === 0 ? (
        <div className="card"><p>Nincs találat.</p></div>
      ) : (
        sorted.map((ev) =>
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
