import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import ReservationForm from "./ReservationForm";

export default function Dashboard() {
  const { session, signOut } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchReservations() {
    if (!session?.user?.id) return;

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", session.user.id)
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setReservations(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchReservations();
  }, [session]);

  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      alert(error.message);
    }
  }

  function handleReservationAdded() {
    setShowForm(false);
    setEditingReservation(null);
    fetchReservations();
  }

  function handleEdit(reservation) {
    setEditingReservation(reservation);
    setShowForm(true);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchReservations();
  }

  const today = new Date().toISOString().split("T")[0];

  const todayReservations = reservations.filter(
    (reservation) => reservation.reservation_date === today
  );

  const upcomingReservations = reservations.filter(
    (reservation) => reservation.reservation_date >= today
  );

  const uniqueCustomers = new Set(
    reservations.map((reservation) => reservation.customer_name)
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">☕</div>
          <div>
            <h2>Café Reserve</h2>
            <span>Table Reservations</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={!showForm ? "nav-item active" : "nav-item"}
            onClick={() => {
              setShowForm(false);
              setEditingReservation(null);
            }}
          >
            📊 Dashboard
          </button>

          <button
            className={showForm ? "nav-item active" : "nav-item"}
            onClick={() => {
              setEditingReservation(null);
              setShowForm(true);
            }}
          >
            📅 Add Reservation
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">
              {(session?.user?.user_metadata?.full_name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {session?.user?.user_metadata?.full_name || "User"}
              </strong>
              <span>{session?.user?.email}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {!showForm ? (
          <>
            <div className="page-header">
              <div>
                <p className="page-label">TODAY AT THE CAFÉ</p>

<h1>Reservation Desk</h1>

<p>
  Welcome back,{" "}
  {session?.user?.user_metadata?.full_name || "User"}.
  Here's what's happening with your reservations.
</p>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  setEditingReservation(null);
                  setShowForm(true);
                }}
              >
                + New Reservation
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div>
                  <span>All Reservations</span>
                  <strong>{reservations.length}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div>
                  <span>Today</span>
                  <strong>{todayReservations.length}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div>
                  <span>Upcoming</span>
                  <strong>{upcomingReservations.length}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div>
                  <span>Guest</span>
                  <strong>{uniqueCustomers.size}</strong>
                </div>
              </div>
            </div>

            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2>Reservation List</h2>
<p>Your upcoming and recent table bookings</p>
                </div>

                <span className="reservation-count">
                  {reservations.length} total
                </span>
              </div>

              {loading && (
                <div className="empty-state">
                  <p>Loading reservations...</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {!loading && !error && reservations.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>Your table book is empty</h3>
<p>Add a reservation and it will appear here.</p>

                  <button
                    className="primary-button"
                    onClick={() => setShowForm(true)}
                  >
                    + Add Reservation
                  </button>
                </div>
              )}

              {!loading && !error && reservations.length > 0 && (
                <div className="reservation-table-container">
                  <table className="reservation-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td>
                            <strong>{reservation.customer_name}</strong>
                          </td>

                          <td>{reservation.reservation_date}</td>

                          <td>{reservation.reservation_time}</td>

                          <td>{reservation.guests}</td>

                          <td>
                            <span className="status-badge">
                              {reservation.status}
                            </span>
                          </td>

                          <td>
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(reservation)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(reservation.id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <div>
            <button
              className="back-button"
              onClick={() => {
                setShowForm(false);
                setEditingReservation(null);
              }}
            >
              ← Back to Dashboard
            </button>

            <ReservationForm
              editingReservation={editingReservation}
              onReservationAdded={handleReservationAdded}
            />
          </div>
        )}
      </main>
    </div>
  );
}