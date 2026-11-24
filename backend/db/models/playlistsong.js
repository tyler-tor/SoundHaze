'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlaylistSong extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlaylistSong.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    playlistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'PlaylistSong',
    // Matches the unique index created by the add-indexes migration (S25).
    indexes: [{ unique: true, fields: ['playlistId', 'songId'] }],
    scopes: {
      addSongs: {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      }
    }
  });
  return PlaylistSong;
};
