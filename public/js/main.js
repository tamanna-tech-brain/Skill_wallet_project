/**
 * IMovies — Client-Side Core JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initSeatSelection();
});

function initSeatSelection() {
  const seatButtons = document.querySelectorAll('.seat.available');
  if (!seatButtons.length && !document.querySelector('.seat-map-wrap')) return;

  const selectedSeats = new Set();
  const seatCountEl = document.getElementById('seatCount');
  const selectedSeatPillsEl = document.getElementById('selectedSeatPills');
  const subtotalEl = document.getElementById('subtotalAmount');
  const taxEl = document.getElementById('taxAmount');
  const totalEl = document.getElementById('totalAmount');
  const bookBtn = document.getElementById('btnProceedBooking');
  const alertEl = document.getElementById('bookingAlert');
  const timerBadge = document.getElementById('lockTimerBadge');
  const countdownEl = document.getElementById('timerCountdown');

  const MAX_SEATS = 6;
  let lockTimer = null;

  seatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const seatNum = btn.dataset.seatNumber;
      const price = parseFloat(btn.dataset.price) || 0;
      const category = btn.dataset.category || 'Standard';

      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        selectedSeats.delete(seatNum);
      } else {
        if (selectedSeats.size >= MAX_SEATS) {
          showAlert(`You can only select up to ${MAX_SEATS} seats per reservation.`);
          return;
        }
        btn.classList.add('selected');
        selectedSeats.add(seatNum);
        hideAlert();
      }

      updateSummary();
    });
  });

  function updateSummary() {
    const selectedArray = Array.from(selectedSeats);
    const count = selectedArray.length;

    if (seatCountEl) seatCountEl.textContent = count;

    if (count === 0) {
      if (selectedSeatPillsEl) {
        selectedSeatPillsEl.innerHTML = '<em style="color: var(--text-muted); font-size: 0.8rem;">None chosen</em>';
      }
      if (subtotalEl) subtotalEl.textContent = '0.00';
      if (taxEl) taxEl.textContent = '0.00';
      if (totalEl) totalEl.textContent = '0.00';
      if (bookBtn) {
        bookBtn.disabled = true;
        bookBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Select Seats to Proceed';
      }
      return;
    }

    // Render chips
    if (selectedSeatPillsEl) {
      selectedSeatPillsEl.innerHTML = selectedArray
        .map((s) => `<span class="seat-chip">${s}</span>`)
        .join('');
    }

    // Calculate prices
    let subtotal = 0;
    selectedArray.forEach((seatNum) => {
      const el = document.querySelector(`[data-seat-number="${seatNum}"]`);
      if (el) subtotal += parseFloat(el.dataset.price) || 0;
    });

    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);

    if (bookBtn) {
      bookBtn.disabled = false;
      bookBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Reserve ${count} Seat${count > 1 ? 's' : ''} ($${total.toFixed(2)})`;
    }
  }

  if (bookBtn) {
    bookBtn.addEventListener('click', async () => {
      const selectedArray = Array.from(selectedSeats);
      if (selectedArray.length === 0) return;

      const showtimeId = window.SHOWTIME_ID;
      if (!showtimeId) {
        showAlert('Showtime identifier is missing.');
        return;
      }

      bookBtn.disabled = true;
      bookBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Reserving seats...';

      try {
        // Step 1: Atomic seat lock
        const lockRes = await fetch('/api/v1/bookings/lock-seats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            showtimeId,
            seatNumbers: selectedArray,
          }),
        });

        const lockData = await lockRes.json();

        if (!lockRes.ok || !lockData.success) {
          if (lockRes.status === 401) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return;
          }
          throw new Error(lockData.message || 'Failed to lock selected seats. They may have just been taken.');
        }

        // Start countdown timer
        startLockCountdown(600); // 10 minutes

        // Step 2: Confirm booking
        bookBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Confirming order...';

        const confirmRes = await fetch('/api/v1/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            showtimeId,
            seatNumbers: selectedArray,
          }),
        });

        const confirmData = await confirmRes.json();

        if (!confirmRes.ok || !confirmData.success) {
          throw new Error(confirmData.message || 'Payment processing error. Please try again.');
        }

        // Redirect to booking confirmation pass
        const bookingId = confirmData.data?.booking?._id || confirmData.data?.booking?.id;
        if (bookingId) {
          window.location.href = `/bookings/${bookingId}/confirm`;
        } else {
          window.location.href = '/my-bookings';
        }
      } catch (err) {
        showAlert(err.message || 'An unexpected error occurred during reservation.');
        bookBtn.disabled = false;
        bookBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Try Again';
      }
    });
  }

  function startLockCountdown(seconds) {
    if (timerBadge) timerBadge.style.display = 'block';
    let remaining = seconds;

    clearInterval(lockTimer);
    lockTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(lockTimer);
        showAlert('Seat lock expired. Please refresh and re-select your seats.');
        if (bookBtn) bookBtn.disabled = true;
        return;
      }
      const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
      const secs = (remaining % 60).toString().padStart(2, '0');
      if (countdownEl) countdownEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function showAlert(msg) {
    if (alertEl) {
      alertEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${msg}</span>`;
      alertEl.style.display = 'flex';
      alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert(msg);
    }
  }

  function hideAlert() {
    if (alertEl) alertEl.style.display = 'none';
  }
}
