import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ReservationForm({
  onReservationAdded,
  editingReservation,
}) {
  const { session } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (editingReservation) {
      setCustomerName(editingReservation.customer_name);
      setReservationDate(editingReservation.reservation_date);
      setReservationTime(editingReservation.reservation_time);
      setGuests(editingReservation.guests);
    } else {
      setCustomerName("");
      setReservationDate("");
      setReservationTime("");
      setGuests(1);
    }
  }, [editingReservation]);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (editingReservation) {
      const { error } = await supabase
        .from("reservations")
        .update({
          customer_name: customerName,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          guests: Number(guests),
        })
        .eq("id", editingReservation.id)
        .eq("user_id", session.user.id);

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Reservation updated successfully!");

        if (onReservationAdded) {
          onReservationAdded();
        }
      }
    } else {
      const { error } = await supabase
        .from("reservations")
        .insert([
          {
            user_id: session.user.id,
            customer_name: customerName,
            reservation_date: reservationDate,
            reservation_time: reservationTime,
            guests: Number(guests),
            status: "Confirmed",
          },
        ]);

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Reservation added successfully!");

        setCustomerName("");
        setReservationDate("");
        setReservationTime("");
        setGuests(1);

        if (onReservationAdded) {
          onReservationAdded();
        }
      }
    }

    setLoading(false);
  }

  return (
    <div className="reservation-form-container">
      <h2>
        {editingReservation ? "Edit Reservation" : "Add Reservation"}
      </h2>

      <p>
        {editingReservation
          ? "Update the reservation details."
          : "Create a new café reservation."}
      </p>

      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-group">
          <label>Customer Name</label>

          <input
            type="text"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Reservation Date</label>

          <input
            type="date"
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Reservation Time</label>

          <input
            type="time"
            value={reservationTime}
            onChange={(e) => setReservationTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Guests</label>

          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : editingReservation
              ? "Update Reservation"
              : "Add Reservation"}
        </button>
      </form>
    </div>
  );
}