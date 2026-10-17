async (page) => {
  const browser = page.context().browser();
  const context = await browser.newContext({
    recordVideo: {
      dir: 'c:\\Project\\Movie\\public\\videos\\',
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 }
  });

  const recPage = await context.newPage();

  // 1. Home
  await recPage.goto('http://localhost:5000');
  await recPage.waitForTimeout(2500);
  await recPage.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
  await recPage.waitForTimeout(1500);
  await recPage.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
  await recPage.waitForTimeout(1500);
  await recPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await recPage.waitForTimeout(1200);

  // 2. Sign In as User
  await recPage.click('a[href="/login"]');
  await recPage.waitForTimeout(1500);
  await recPage.fill('input[name="email"]', 'user@imovies.com');
  await recPage.waitForTimeout(600);
  await recPage.fill('input[name="password"]', 'User@12345');
  await recPage.waitForTimeout(600);
  await recPage.click('button[type="submit"]');
  await recPage.waitForTimeout(2000);

  // 3. Movies Catalog
  await recPage.click('a[href="/movies"]');
  await recPage.waitForTimeout(2000);

  // 4. Movie Detail
  await recPage.click('.movie-card');
  await recPage.waitForTimeout(2000);
  await recPage.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await recPage.waitForTimeout(1500);

  // 5. Select Showtime -> Seat Map
  await recPage.click('.showtime-card');
  await recPage.waitForTimeout(2000);

  // 6. Select Seats
  const seatButtons = await recPage.$$('.seat.available');
  if (seatButtons.length >= 2) {
    await seatButtons[0].click();
    await recPage.waitForTimeout(800);
    await seatButtons[1].click();
    await recPage.waitForTimeout(1200);
  }

  // 7. Lock & Confirm
  await recPage.click('#btnProceedBooking');
  await recPage.waitForTimeout(4000);

  // 8. My Bookings
  await recPage.click('a[href="/my-bookings"]');
  await recPage.waitForTimeout(2500);

  // 9. Sign Out
  await recPage.goto('http://localhost:5000/logout');
  await recPage.waitForTimeout(1500);

  // 10. Sign In as Admin
  await recPage.goto('http://localhost:5000/login');
  await recPage.waitForTimeout(1200);
  await recPage.fill('input[name="email"]', 'admin@imovies.com');
  await recPage.waitForTimeout(600);
  await recPage.fill('input[name="password"]', 'Admin@12345');
  await recPage.waitForTimeout(600);
  await recPage.click('button[type="submit"]');
  await recPage.waitForTimeout(2000);

  // 11. Admin Dashboard
  await recPage.goto('http://localhost:5000/admin');
  await recPage.waitForTimeout(2500);
  await recPage.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await recPage.waitForTimeout(1500);

  // 12. Admin Movies Catalog
  await recPage.goto('http://localhost:5000/admin/movies');
  await recPage.waitForTimeout(2500);

  // Get video path and close
  const videoObj = recPage.video();
  await recPage.close();
  await context.close();

  const finalVideoPath = videoObj ? await videoObj.path() : null;
  return { success: true, videoPath: finalVideoPath };
}
