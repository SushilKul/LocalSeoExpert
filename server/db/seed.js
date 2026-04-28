require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, testConnection } = require('./pool');

async function seed() {
  await testConnection();
  console.log('🌱  Seeding database...');

  // ─── Users ─────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('demo123', 12);

  const { rows: [agency] } = await query(`
    INSERT INTO users (email, username, password, full_name, role)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id
  `, ['agency@demo.com', 'agencyuser', hash, 'Alex Rivera', 'Agency Manager']);

  const { rows: [owner] } = await query(`
    INSERT INTO users (email, username, password, full_name, role)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id
  `, ['owner@demo.com', 'bizowner', hash, 'Sam Patel', 'Business Owner']);

  console.log('  ✅  Users seeded');

  // ─── Locations ─────────────────────────────────────────────────────────────
  const locations = [
    { user_id: agency.id, name: 'The Green Leaf Cafe', address: '42 Market St, Pune 411001', phone: '+91 98765 43210', website: 'https://greenleaf.co', category: 'Cafe & Restaurant', hours: 'Mon-Sun 8am-10pm', rating: 4.6, review_count: 47, post_count: 8 },
    { user_id: agency.id, name: 'BlueSky Digital Agency', address: 'Level 5, Tech Park, Hinjewadi, Pune', phone: '+91 98123 45678', website: 'https://bluesky.agency', category: 'Marketing Agency', hours: 'Mon-Fri 9am-7pm', rating: 4.8, review_count: 23, post_count: 15 },
    { user_id: agency.id, name: 'FitZone Gym & Wellness', address: '101 Fitness Rd, Kothrud, Pune', phone: '+91 97654 32109', website: 'https://fitzone.in', category: 'Gym & Fitness', hours: 'Mon-Sat 6am-11pm', rating: 4.3, review_count: 89, post_count: 22 },
    { user_id: owner.id, name: 'Patel Tech Solutions', address: 'SEZ Block C, Magarpatta, Pune', phone: '+91 96543 21098', website: 'https://pateltech.io', category: 'IT Services', hours: 'Mon-Fri 9am-6pm', status: 'paused', rating: 4.5, review_count: 12, post_count: 5 },
  ];

  const locIds = [];
  for (const loc of locations) {
    const { rows: [row] } = await query(`
      INSERT INTO locations (user_id, name, address, phone, website, category, hours, status, rating, review_count, post_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [loc.user_id, loc.name, loc.address, loc.phone, loc.website, loc.category, loc.hours, loc.status || 'active', loc.rating, loc.review_count, loc.post_count]);
    if (row) locIds.push(row.id);
  }
  console.log(`  ✅  ${locIds.length} locations seeded`);

  if (locIds.length < 4) {
    console.log('  ⚠️   Locations already exist — skipping reviews/posts/keywords seed');
    process.exit(0);
  }

  const [loc1, loc2, loc3, loc4] = locIds;

  // ─── Reviews ───────────────────────────────────────────────────────────────
  const reviews = [
    { location_id: loc1, reviewer_name: 'Priya Sharma',  rating: 5, comment: 'Absolutely love the ambiance and the oat milk latte is divine! Will definitely come back.', review_date: '2025-06-01' },
    { location_id: loc1, reviewer_name: 'Rahul Mehta',   rating: 4, comment: 'Great food, slightly long wait times on weekends.', review_date: '2025-05-28', reply_text: 'Thank you Rahul! We are working on improving weekend wait times.' },
    { location_id: loc1, reviewer_name: 'Anjali Nair',   rating: 2, comment: 'Disappointed with the service today. Staff seemed inattentive.', review_date: '2025-05-20' },
    { location_id: loc1, reviewer_name: 'Vikram Singh',  rating: 5, comment: 'Best coffee in Pune hands down.', review_date: '2025-05-15', reply_text: 'Thanks so much Vikram! Our cold brew is our pride 🙏' },
    { location_id: loc2, reviewer_name: 'Deepa R.',       rating: 5, comment: 'BlueSky transformed our online presence completely!', review_date: '2025-06-02', reply_text: 'Thank you Deepa! Thrilled to contribute to your growth.' },
    { location_id: loc2, reviewer_name: 'Arun Kumar',    rating: 4, comment: 'Professional team, great results. Communication could be slightly better.', review_date: '2025-05-30' },
    { location_id: loc3, reviewer_name: 'Sneha D.',       rating: 5, comment: 'Amazing trainers and great equipment!', review_date: '2025-06-03' },
    { location_id: loc3, reviewer_name: 'Karan V.',       rating: 3, comment: 'Good gym but the AC was not working for a week.', review_date: '2025-05-25', reply_text: 'Hi Karan, AC fully repaired. Please visit again!' },
    { location_id: loc4, reviewer_name: 'Nisha M.',       rating: 5, comment: 'Outstanding tech support. Fixed our server infrastructure within hours.', review_date: '2025-05-10' },
  ];

  for (const r of reviews) {
    await query(`
      INSERT INTO reviews (location_id, reviewer_name, rating, comment, review_date, reply_text, replied_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [r.location_id, r.reviewer_name, r.rating, r.comment, r.review_date, r.reply_text || null, r.reply_text ? new Date() : null]);
  }
  console.log(`  ✅  ${reviews.length} reviews seeded`);

  // ─── Posts ─────────────────────────────────────────────────────────────────
  const posts = [
    { location_id: loc1, type: 'OFFER',     summary: '🎉 Weekend Special: Buy 2 coffees, get 1 free! Code WEEKEND20.', cta_text: 'Learn More' },
    { location_id: loc1, type: 'EVENT',     summary: 'Join our Latte Art Workshop on June 15th at 3pm. Limited seats!', cta_text: 'Sign Up' },
    { location_id: loc1, type: 'WHATS_NEW', summary: 'New Summer menu featuring mango cold brew and açaí bowls.', cta_text: 'See Menu' },
    { location_id: loc2, type: 'WHATS_NEW', summary: 'BlueSky Digital awarded Best SEO Agency in Pune 2025!', cta_text: 'Read More' },
    { location_id: loc2, type: 'OFFER',     summary: 'Free local SEO audit for new clients in June.', cta_text: 'Book Now' },
    { location_id: loc3, type: 'EVENT',     summary: 'Summer Fitness Challenge starts July 1st — 30 days, amazing prizes!', cta_text: 'Join Now' },
  ];

  for (const p of posts) {
    await query(`
      INSERT INTO posts (location_id, type, summary, cta_text) VALUES ($1,$2,$3,$4)
    `, [p.location_id, p.type, p.summary, p.cta_text]);
  }
  console.log(`  ✅  ${posts.length} posts seeded`);

  // ─── Keywords ──────────────────────────────────────────────────────────────
  const keywordData = [
    { location_id: loc1, keyword: 'best cafe pune',              ranks: [8, 6, 5, 4, 3] },
    { location_id: loc1, keyword: 'coffee shop near market street', ranks: [3, 2, 2, 1, 1] },
    { location_id: loc1, keyword: 'avocado toast pune',          ranks: [12, 10, 9, 8, 7] },
    { location_id: loc2, keyword: 'seo agency pune',             ranks: [5, 4, 3, 2, 2] },
    { location_id: loc2, keyword: 'digital marketing hinjewadi', ranks: [4, 5, 4, 4, 4] },
    { location_id: loc3, keyword: 'gym kothrud pune',            ranks: [2, 1, 1, 1, 1] },
    { location_id: loc3, keyword: 'yoga classes pune',           ranks: [9, 8, 7, 6, 6] },
    { location_id: loc4, keyword: 'it support magarpatta',       ranks: [10, 9, 9, 8, 8] },
  ];

  for (const kd of keywordData) {
    const { rows: [kw] } = await query(`
      INSERT INTO keywords (location_id, keyword) VALUES ($1,$2) RETURNING id
    `, [kd.location_id, kd.keyword]);

    // Seed historical ranks (oldest → newest, going back 5 days)
    for (let i = 0; i < kd.ranks.length; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (kd.ranks.length - 1 - i));
      await query(`
        INSERT INTO keyword_ranks (keyword_id, rank, snapshot_date) VALUES ($1,$2,$3)
        ON CONFLICT DO NOTHING
      `, [kw.id, kd.ranks[i], d.toISOString().split('T')[0]]);
    }
  }
  console.log(`  ✅  ${keywordData.length} keywords + rank history seeded`);

  // ─── Insights ──────────────────────────────────────────────────────────────
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  for (const locId of locIds) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      await query(`
        INSERT INTO location_insights (location_id, metric_date, views, searches, calls, website_clicks)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (location_id, metric_date) DO NOTHING
      `, [locId, d.toISOString().split('T')[0], rand(200, 800), rand(100, 400), rand(20, 100), rand(40, 160)]);
    }
  }
  console.log(`  ✅  7-day insights seeded for ${locIds.length} locations`);

  console.log('\n🎉  Seed complete!\n');
  console.log('   Demo accounts:');
  console.log('   📧  agency@demo.com  /  demo123  (Agency Manager)');
  console.log('   📧  owner@demo.com   /  demo123  (Business Owner)\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
