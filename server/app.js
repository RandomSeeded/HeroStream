'use strict';

const _ = require('lodash');
const assert = require('assert');
const async = require('async');
const express = require('express');
const path = require('path');
const request = require('request');

const app = express();
const PORT = 5975;
const { clientId, bearer } = require('./clientId');
assert(clientId, 'Error: missing configuration file');

app.use(express.static(path.join(__dirname, '../client')));

const OVERWATCH_GAME_ID = 488552;
const REFRESH_RATE = 60000;
const heros = [];

/**
 * apis needed:
 * - streams/metadata: provides a list of tuples with heroes / user_ids
 * - users: translates user_ids into channels
 **/
const metadataRequest = {
  url: 'https://api.twitch.tv/helix/streams/metadata',
  qs: {
    first: 100,
    game_id: OVERWATCH_GAME_ID,
  },
  headers: {
    'Client-ID': clientId,
  },
};
const usersRequest = {
  url: 'https://api.twitch.tv/helix/users',
  qs: {
    first: 100,
    // id: [137512364],
  },
  headers: {
    'Client-ID': clientId,
  },
  auth: {
    bearer,
  },
};

function getMetadata() {
  // let streamsByHero;
  let streamsWithHeros;
  async.waterfall([
    cb => {
      request.get(metadataRequest, cb);
    },
    (res, body, cb) => {
      const parsedBody = JSON.parse(body);
      const streams = parsedBody.data;
      streamsWithHeros = _.filter(streams, stream => {
        return _.has(stream, 'overwatch.broadcaster.hero.name');
      });
      // Dont calculate streams by hero here. Not necessary.
      // streamsByHero = _.groupBy(streamsWithHeros, stream => {
      //   return _.get(stream, 'overwatch.broadcaster.hero.name');
      // });
      const usersRequestOpts = _.merge({}, usersRequest, {
        qs: {
          id: _.map(streamsWithHeros, 'user_id'),
        },
      });
      request.get(usersRequestOpts, cb);
    },
    (res, body, cb) => {
      const data = JSON.parse(body).data;
      const streamsByUserId = _.keyBy(data, 'id');
      const mergedStreamData = _.map(streamsWithHeros, stream => {
        return _.extend({}, stream, streamsByUserId[stream.user_id]);
      });
      // console.dir(_.first(mergedStreamData), { depth: null });
      const streamsByHero = _.groupBy(mergedStreamData, stream => {
        const hero = _.get(stream, 'overwatch.broadcaster.hero.name');
        return hero;
      });
      console.log('streamsByHero', streamsByHero);
    },
  ]);
}
getMetadata();
setInterval(getMetadata, REFRESH_RATE);

app.get('/', function (req, res) {
    res.send('Hello World')
});

app.listen(PORT);

// todo (frontend): allow frontend to choose whether or not to auto-switch.
// Also the backend should pass to the frontend a full list of streams for the hero
// So behavior is: when you first join you're in auto-spectate mode. If you manually choose an alternate stream or turn off auto-switch, then you're in manual mode
