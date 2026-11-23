// backend/db/seeders/20261123000000-demo-data.js
//
// Inserts the demo data (users, albums, songs, playlists, comments) from
// db/seed-data.js. Safe to run on every deploy:
//   - It does nothing if the database already has users (in particular the
//     demo user), so it never touches real data and never duplicates rows.
//   - It never sets primary-key ids. The database assigns them, and related
//     rows look the ids up by username / title, so Postgres' auto-increment
//     counters stay correct.
//   - Everything runs in one transaction: either all demo data is inserted
//     or none of it.
//   - "down" (seed undo) refuses to run when NODE_ENV=production.
// See CHANGES.md, S0.
'use strict';

const bcrypt = require('bcryptjs');
const data = require('../seed-data');
const { assertNotProduction } = require('../safety');

const DEMO_USERNAME = 'Demo-lition';

// The old Render setup put the tables in a Postgres schema (SCHEMA env var).
const schema = process.env.NODE_ENV === 'production' ? process.env.SCHEMA : undefined;
const table = (tableName) => (schema ? { tableName, schema } : tableName);

// Returns a Map of key -> id for rows of `tableName` whose `column` is in `keys`.
async function idsBy(queryInterface, tableName, column, keys, transaction) {
  const rows = await queryInterface.select(null, table(tableName), {
    attributes: ['id', column],
    where: { [column]: keys },
    transaction,
    raw: true
  });
  const map = new Map(rows.map((row) => [row[column], row.id]));
  for (const key of keys) {
    if (!map.has(key)) throw new Error(`Seed lookup failed: ${tableName}.${column} = ${key}`);
  }
  return map;
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const existing = await queryInterface.select(null, table('Users'), {
        attributes: ['id', 'username'],
        limit: 1,
        transaction,
        raw: true
      });
      const demo = await queryInterface.select(null, table('Users'), {
        attributes: ['id'],
        where: { username: DEMO_USERNAME },
        transaction,
        raw: true
      });
      if (demo.length || existing.length) {
        console.log(
          demo.length
            ? `Demo user "${DEMO_USERNAME}" already exists: skipping demo seed data.`
            : 'Users table is not empty: skipping demo seed data (seeds only go into an empty database).'
        );
        return;
      }

      // Users
      await queryInterface.bulkInsert(table('Users'), data.users.map((u) => ({
        username: u.username,
        email: u.email,
        hashedPassword: bcrypt.hashSync(u.password),
        previewImage: u.previewImage
      })), { transaction });
      const userIds = await idsBy(queryInterface, 'Users', 'username',
        data.users.map((u) => u.username), transaction);

      // Albums
      await queryInterface.bulkInsert(table('Albums'), data.albums.map((a) => ({
        title: a.title,
        description: a.description,
        previewImage: a.previewImage,
        userId: userIds.get(a.owner)
      })), { transaction });
      const albumIds = await idsBy(queryInterface, 'Albums', 'title',
        data.albums.map((a) => a.title), transaction);

      // Songs
      await queryInterface.bulkInsert(table('Songs'), data.songs.map((s) => ({
        title: s.title,
        description: s.description,
        url: s.url,
        previewImage: s.previewImage,
        albumId: s.album ? albumIds.get(s.album) : null,
        userId: userIds.get(s.owner)
      })), { transaction });
      const songIds = await idsBy(queryInterface, 'Songs', 'title',
        data.songs.map((s) => s.title), transaction);

      // Playlists
      await queryInterface.bulkInsert(table('Playlists'), data.playlists.map((p) => ({
        name: p.name,
        previewImage: p.previewImage,
        userId: userIds.get(p.owner)
      })), { transaction });
      const playlistIds = await idsBy(queryInterface, 'Playlists', 'name',
        data.playlists.map((p) => p.name), transaction);

      // Songs in playlists
      await queryInterface.bulkInsert(table('PlaylistSongs'), data.playlists.flatMap((p) =>
        p.songs.map((title) => ({
          playlistId: playlistIds.get(p.name),
          songId: songIds.get(title)
        }))
      ), { transaction });

      // Comments
      await queryInterface.bulkInsert(table('Comments'), data.comments.map((c) => ({
        body: c.body,
        songId: songIds.get(c.song),
        userId: userIds.get(c.author)
      })), { transaction });

      console.log('Demo seed data inserted.');
    });
  },

  async down(queryInterface) {
    assertNotProduction('undo the demo seed data');
    // Development only: empty the tables (children first).
    for (const name of ['Comments', 'PlaylistSongs', 'Playlists', 'Songs', 'Albums', 'Users']) {
      await queryInterface.bulkDelete(table(name), null, {});
    }
  }
};
