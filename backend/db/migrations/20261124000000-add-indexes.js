// S25: indexes on the foreign-key columns (Postgres does not create them
// automatically) and a UNIQUE index so a song cannot be in the same playlist
// twice. Safe on a live database: it only adds indexes. The one data change is
// removing duplicate (playlistId, songId) join rows (keeping the oldest) so the
// unique index can be created; it does nothing when there are no duplicates.
'use strict';

let schema;
if (process.env.NODE_ENV === 'production') {
  schema = process.env.SCHEMA;
}

const table = (name) => (schema ? { tableName: name, schema } : name);
const quoted = (name) => (schema ? `"${schema}"."${name}"` : `"${name}"`);

const INDEXES = [
  ['Songs', ['userId'], 'songs_user_id'],
  ['Songs', ['albumId'], 'songs_album_id'],
  ['Albums', ['userId'], 'albums_user_id'],
  ['Playlists', ['userId'], 'playlists_user_id'],
  ['Comments', ['songId'], 'comments_song_id'],
  ['Comments', ['userId'], 'comments_user_id']
];

module.exports = {
  async up(queryInterface) {
    for (const [name, fields, indexName] of INDEXES) {
      await queryInterface.addIndex(table(name), fields, { name: indexName });
    }

    // Keep the oldest row of each duplicate group.
    const ps = quoted('PlaylistSongs');
    await queryInterface.sequelize.query(
      `DELETE FROM ${ps} WHERE id NOT IN (SELECT MIN(id) FROM ${ps} GROUP BY "playlistId", "songId")`
    );
    await queryInterface.addIndex(table('PlaylistSongs'), ['playlistId', 'songId'], {
      name: 'playlist_songs_playlist_id_song_id',
      unique: true
    });
  },

  // Dropping an index never loses data, so (unlike the table migrations) this
  // is allowed in production.
  async down(queryInterface) {
    await queryInterface.removeIndex(table('PlaylistSongs'), 'playlist_songs_playlist_id_song_id');
    for (const [name, , indexName] of INDEXES) {
      await queryInterface.removeIndex(table(name), indexName);
    }
  }
};
