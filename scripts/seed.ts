import { createDbMovie } from '@/lib/createDbMovie';
import { TMDBMovieResponse } from '@/types/tmdb';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { movie, movieToShortlist } from '../src/db/schema/movies';
import { shortlist } from '../src/db/schema/shortlists';
import { moviesOnTiers, tier, tierlist } from '../src/db/schema/tierlists';
import { user } from '../src/db/schema/users';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!process.env.VITE_TMDB_API_KEY) {
  throw new Error('VITE_TMDB_API_KEY environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// TMDB API configuration
const TMDB_CONFIG = {
  API_KEY: process.env.VITE_TMDB_API_KEY,
  BASE_URL: 'https://api.themoviedb.org/3',
};

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

async function fetchPopularMovies(page: number = 1): Promise<TMDBMovie[]> {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_CONFIG.API_KEY}&page=${page}&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&watch_region=FI&with_watch_providers=8%7C323%7C496`
  

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
}

async function fetchMovieDetails(tmdbId: number): Promise<TMDBMovieResponse> {
  const url = `${TMDB_CONFIG.BASE_URL}/movie/${tmdbId}?api_key=${TMDB_CONFIG.API_KEY}&append_to_response=credits,external_ids,images,similar,videos,watch/providers`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getWatchDate(weeksAgo: number): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
  const thisWednesday = new Date(now);
  thisWednesday.setDate(now.getDate() + daysUntilWednesday);
  thisWednesday.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(thisWednesday);
  targetDate.setDate(thisWednesday.getDate() - (weeksAgo * 7));
  
  return targetDate.toISOString().split('T')[0];
}

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    console.log('Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUsers = [
      {
        id: generateId('user'),
        email: 'alice@movieclub.test',
        name: 'Alice Johnson',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        emailVerified: null,
        shortlistId: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        accountId: null,
        sessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
      {
        id: generateId('user'),
        email: 'bob@movieclub.test',
        name: 'Bob Smith',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        emailVerified: null,
        shortlistId: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        accountId: null,
        sessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
      {
        id: generateId('user'),
        email: 'charlie@movieclub.test',
        name: 'Charlie Davis',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        emailVerified: null,
        shortlistId: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        accountId: null,
        sessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
      {
        id: generateId('user'),
        email: 'diana@movieclub.test',
        name: 'Diana Martinez',
        password: hashedPassword,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
        emailVerified: null,
        shortlistId: null,
        tmdbAccountId: null,
        tmdbSessionId: null,
        accountId: null,
        sessionId: null,
        radarrApiKey: null,
        radarrEnabled: false,
        radarrMonitored: true,
        radarrQualityProfileId: null,
        radarrRootFolder: null,
        radarrUrl: null,
      },
    ];
    
    await db.insert(user).values(testUsers);
    console.log(`✅ Created ${testUsers.length} test users`);
    
    console.log('Fetching movies from TMDB...');
    const allTmdbMovies: TMDBMovie[] = [];
    
    for (let page = 1; page <= 7; page++) {
      const movies = await fetchPopularMovies(page);
      allTmdbMovies.push(...movies);
      console.log(`Fetched page ${page}: ${movies.length} movies`);
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    console.log(`Total movies fetched: ${allTmdbMovies.length}`);
    
    const historyMovies = allTmdbMovies.slice(0, 100);
    const shortlistMovies = allTmdbMovies.slice(100, 130);
    
    console.log('Creating watched movies with historical data...');
    const watchedMovieIds: string[] = [];
    
    for (let i = 0; i < historyMovies.length; i++) {
      const tmdbMovie = historyMovies[i];
      const userIndex = i % testUsers.length; // Distribute movies evenly
      const weeksAgo = i; // Week 0 (this week) to week 99
      
      const movieDetails = await fetchMovieDetails(tmdbMovie.id);
      const movieData = await createDbMovie(movieDetails);
      
      const movieId = generateId('movie');
      watchedMovieIds.push(movieId);
      
      await db.insert(movie).values({
        id: movieId,
        watchDate: getWatchDate(weeksAgo),
        userId: testUsers[userIndex].id,
        ...movieData,
      });
      
      if ((i + 1) % 10 === 0) {
        console.log(`Created ${i + 1}/100 watched movies`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    console.log('✅ Created 100 watched movies');
    
    console.log('Creating shortlists...');
    const shortlistData = [];
    
    for (const testUser of testUsers) {
      const shortlistId = generateId('shortlist');
      shortlistData.push({
        id: shortlistId,
        userId: testUser.id,
        isReady: true,
        requiresSelection: false,
        selectedIndex: null,
        participating: true,
      });
    }
    
    await db.insert(shortlist).values(shortlistData);
    console.log(`✅ Created ${shortlistData.length} shortlists`);
    
    console.log('Adding movies to shortlists...');
    const shortlistMovieData = [];
    const shortlistMovieIds: string[] = [];
    
    for (let i = 0; i < shortlistData.length; i++) {
      const shortlistItem = shortlistData[i];
      const numMovies = i === 0 || i === 1 ? 3 : (i === 2 ? 2 : 1); 
      
      for (let j = 0; j < numMovies; j++) {
        const movieIndex = i * 3 + j;
        if (movieIndex >= shortlistMovies.length) break;
        
        const tmdbMovie = shortlistMovies[movieIndex];
        const movieDetails = await fetchMovieDetails(tmdbMovie.id);
        const movieData = await createDbMovie(movieDetails);
        
        const movieId = generateId('movie');
        shortlistMovieIds.push(movieId);
        
        await db.insert(movie).values({
          id: movieId,
          ...movieData,
        });
        
        shortlistMovieData.push({
          a: movieId, // movie id
          b: shortlistItem.id, // shortlist id
        });
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      
      console.log(`Added ${numMovies} movies to shortlist for ${testUsers[i].name}`);
    }
    
    await db.insert(movieToShortlist).values(shortlistMovieData);
    console.log('✅ Added movies to shortlists');
    
    // Create tierlists for each user with 5 tiers
    console.log('Creating tierlists with 5 tiers...');
    const tierLabels = ['S - Masterpiece', 'A - Excellent', 'B - Good', 'C - Average', 'D - Poor'];
    const tierValues = [5, 4, 3, 2, 1];
    
    for (let userIndex = 0; userIndex < testUsers.length; userIndex++) {
      const testUser = testUsers[userIndex];
      const tierlistId = generateId('tierlist');
      
      await db.insert(tierlist).values({
        id: tierlistId,
        userId: testUser.id,
        title: `${testUser.name}'s Rankings`,
        watchDate: null,
        genres: null,
      });
      
      // Create 5 tiers
      const tierIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const tierId = generateId('tier');
        tierIds.push(tierId);
        
        await db.insert(tier).values({
          id: tierId,
          label: tierLabels[i],
          value: tierValues[i],
          tierlistId: tierlistId,
        });
      }
      
      // Distribute the 100 movies across the 5 tiers for this user
      // Get movies for this user (every 4th movie starting from userIndex)
      const userMovieIds = watchedMovieIds.filter((_, idx) => idx % 4 === userIndex);
      
      // Distribute movies across tiers (more in middle tiers)
      const moviesPerTier = [
        Math.floor(userMovieIds.length * 0.1), // S tier - 10%
        Math.floor(userMovieIds.length * 0.2), // A tier - 20%
        Math.floor(userMovieIds.length * 0.4), // B tier - 40%
        Math.floor(userMovieIds.length * 0.2), // C tier - 20%
        0, // D tier - will get the rest
      ];
      moviesPerTier[4] = userMovieIds.length - moviesPerTier.slice(0, 4).reduce((a, b) => a + b, 0);
      
      let movieOffset = 0;
      for (let tierIndex = 0; tierIndex < 5; tierIndex++) {
        const moviesInThisTier = moviesPerTier[tierIndex];
        const tierId = tierIds[tierIndex];
        
        for (let position = 0; position < moviesInThisTier; position++) {
          const movieId = userMovieIds[movieOffset + position];
          
          await db.insert(moviesOnTiers).values({
            id: generateId('movieOnTier'),
            position: position,
            movieId: movieId,
            tierId: tierId,
          });
        }
        
        movieOffset += moviesInThisTier;
      }
      
      console.log(`✅ Created tierlist for ${testUser.name} with ${userMovieIds.length} movies`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nTest users:');
    testUsers.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - password: password123`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
