require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Clearing existing data...');

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theater.deleteMany({}),
      Screen.deleteMany({}),
      Showtime.deleteMany({}),
      Seat.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    console.log('Old collections cleared. Seeding users...');

    // 1. Users
    const [admin, demoUser] = await Promise.all([
      User.create({
        name: 'Cinema Administrator',
        email: 'admin@imovies.com',
        password: 'Admin@12345',
        phone: '+1 800 555 0199',
        role: 'admin',
      }),
      User.create({
        name: 'Jane Doe',
        email: 'user@imovies.com',
        password: 'User@12345',
        phone: '+1 800 555 0142',
        role: 'user',
      }),
    ]);

    console.log('Seeding movies...');

    // 2. Movies
    const movies = await Movie.create([
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: ['English'],
        formats: ['IMAX', '3D', '2D'],
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        rating: { imdb: 8.6, votes: 450000 },
        status: 'now_showing',
        isActive: true,
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        genre: ['Biography', 'Drama', 'History'],
        language: ['English'],
        formats: ['IMAX', '2D'],
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        rating: { imdb: 8.9, votes: 720000 },
        status: 'now_showing',
        isActive: true,
      },
      {
        title: 'Interstellar: 10th Anniversary',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        duration: 169,
        releaseDate: new Date('2024-11-06'),
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        language: ['English'],
        formats: ['IMAX', '70mm', '2D'],
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        rating: { imdb: 8.7, votes: 1900000 },
        status: 'now_showing',
        isActive: true,
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome.',
        duration: 148,
        releaseDate: new Date('2026-11-22'),
        genre: ['Action', 'Adventure', 'Drama'],
        language: ['English'],
        formats: ['IMAX', '4DX', '2D'],
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        rating: { imdb: 8.1, votes: 110000 },
        status: 'upcoming',
        isActive: true,
      },
      {
        title: 'Avengers: Secret Wars',
        description: 'The multiverse collapses into a singular chaotic reality where Earth heroes and interdimensional variants must fight for cosmic survival.',
        duration: 175,
        releaseDate: new Date('2027-05-07'),
        genre: ['Action', 'Sci-Fi', 'Fantasy'],
        language: ['English'],
        formats: ['IMAX', '3D', '4DX'],
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com',
        rating: { imdb: 9.1, votes: 54000 },
        status: 'upcoming',
        isActive: true,
      },
    ]);

    console.log('Seeding theaters & screens...');

    // 3. Theaters
    const theater1 = await Theater.create({
      name: 'IMovies Grand Lux Cinema — Downtown',
      address: {
        street: '742 Evergreen Blvd',
        city: 'New York',
        state: 'NY',
        pincode: '10001',
      },
      contactPhone: '+1 212 555 7890',
      email: 'downtown@imovies.com',
      isActive: true,
    });

    const theater2 = await Theater.create({
      name: 'IMovies IMAX Center — Uptown Galleria',
      address: {
        street: '1200 Avenue of the Arts',
        city: 'New York',
        state: 'NY',
        pincode: '10023',
      },
      contactPhone: '+1 212 555 4321',
      email: 'uptown@imovies.com',
      isActive: true,
    });

    // 4. Screens
    const screen1 = await Screen.create({
      theater: theater1._id,
      screenName: 'Screen 1 — IMAX Laser',
      format: 'IMAX',
      totalSeats: 48,
      layout: {
        rows: 6,
        columns: 8,
        seatCategories: [
          { category: 'VIP', rows: ['F'], price: 25 },
          { category: 'Premium', rows: ['D', 'E'], price: 18 },
          { category: 'Standard', rows: ['A', 'B', 'C'], price: 12 },
        ],
      },
      isActive: true,
    });

    const screen2 = await Screen.create({
      theater: theater2._id,
      screenName: 'Auditorium 2 — Dolby Atmos 4K',
      format: '2D',
      totalSeats: 48,
      layout: {
        rows: 6,
        columns: 8,
        seatCategories: [
          { category: 'VIP', rows: ['F'], price: 22 },
          { category: 'Premium', rows: ['D', 'E'], price: 16 },
          { category: 'Standard', rows: ['A', 'B', 'C'], price: 11 },
        ],
      },
      isActive: true,
    });

    console.log('Seeding showtimes & live seat maps...');

    // 5. Showtimes & Seats
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = 8;
    const nowShowingMovies = movies.filter(m => m.status === 'now_showing');

    const showtimeSlots = [
      { hour: 14, min: 30, format: 'IMAX', theater: theater1, screen: screen1 },
      { hour: 18, min: 0,  format: 'IMAX', theater: theater1, screen: screen1 },
      { hour: 21, min: 15, format: '2D',   theater: theater2, screen: screen2 },
    ];

    let createdShowtimes = [];

    for (const movie of nowShowingMovies) {
      for (const slot of showtimeSlots) {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 1); // Tomorrow
        startTime.setHours(slot.hour, slot.min, 0, 0);

        const endTime = new Date(startTime.getTime() + movie.duration * 60000);

        const showtime = await Showtime.create({
          movie: movie._id,
          theater: slot.theater._id,
          screen: slot.screen._id,
          startTime,
          endTime,
          language: 'English',
          format: slot.format,
          ticketPrice: {
            standard: 12,
            premium: 18,
            vip: 25,
          },
          totalSeats: 48,
          availableSeats: 48,
          status: 'scheduled',
        });

        createdShowtimes.push(showtime);

        // Generate seats for this showtime
        const seatDocs = [];
        for (const row of rows) {
          for (let col = 1; col <= cols; col++) {
            let category = 'Standard';
            let price = 12;
            if (row === 'F') { category = 'VIP'; price = 25; }
            else if (row === 'D' || row === 'E') { category = 'Premium'; price = 18; }

            seatDocs.push({
              showtime: showtime._id,
              screen: slot.screen._id,
              seatNumber: `${row}${col}`,
              row,
              column: col,
              category,
              price,
              status: 'available',
            });
          }
        }
        await Seat.insertMany(seatDocs);
      }
    }

    console.log('Creating demo booking...');

    // 6. Demo Booking for Jane Doe on first showtime
    if (createdShowtimes.length > 0) {
      const demoShow = createdShowtimes[0];
      const seatsToBook = await Seat.find({ showtime: demoShow._id, seatNumber: { $in: ['E4', 'E5'] } });

      if (seatsToBook.length === 2) {
        const booking = await Booking.create({
          user: demoUser._id,
          showtime: demoShow._id,
          movie: demoShow.movie,
          theater: demoShow.theater,
          seats: seatsToBook.map(s => s._id),
          seatNumbers: ['E4', 'E5'],
          totalAmount: 36,
          status: 'confirmed',
          payment: { status: 'completed' },
        });

        await Seat.updateMany(
          { _id: { $in: seatsToBook.map(s => s._id) } },
          { $set: { status: 'booked', booking: booking._id } }
        );

        await Showtime.findByIdAndUpdate(demoShow._id, { $inc: { availableSeats: -2 } });
      }
    }

    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Credentials:');
    console.log('  Admin User: admin@imovies.com  |  Pass: Admin@12345');
    console.log('  Demo Patron: user@imovies.com  |  Pass: User@12345');
    console.log(`Movies seeded: ${movies.length}`);
    console.log(`Theaters seeded: 2`);
    console.log(`Showtimes generated: ${createdShowtimes.length}`);
    console.log(`Total live seats generated: ${createdShowtimes.length * 48}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
