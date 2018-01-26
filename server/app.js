'use strict';

const _ = require('lodash');
const assert = require('assert');
const async = require('async');
const express = require('express');
const moment = require('moment');
const path = require('path');
const request = require('request');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = 5975;
const { clientId, bearer } = require('./clientId');
assert(clientId, 'Error: missing configuration file');

app.use(express.static(path.join(__dirname, '../client')));
app.get('*', (req, res, next) =>
  res.sendFile('/index.html', { root: path.join(__dirname, '../client') }));

const OVERWATCH_GAME_ID = 488552;
const REFRESH_RATE = 15000;
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

let streamsByHero;
function getStreamsFromBody(body) {
  if (!body) return [];
  const parsedBody = JSON.parse(body);
  const streams = parsedBody.data;
  return _.filter(streams, stream => {
    return _.has(stream, 'overwatch.broadcaster.hero.name');
  });
}

function getMetadata() {
  let streamsWithHeros;
  let firstPage;
  // TODO: verify top 200 wors, convert this into an autoinject :(
  async.waterfall([
    cb => {
      request.get(metadataRequest, cb);
    },
    (res, body, cb) => {
      firstPage = getStreamsFromBody(body);
      if (_.isEmpty(firstPage)) {
        const error = `${moment()}: Twitch not currently returning any streams with heros :(`;
      }
      const parsedBody = JSON.parse(body);
      const metadataSecondPage = _.merge({}, metadataRequest, {
        qs: { after: _.get(parsedBody,'pagination.cursor') },
      });
      // console.log('metadataSecondPage', metadataSecondPage);
      request.get(metadataSecondPage, cb);
    },
    (res, body, cb) => {
      const secondPage = getStreamsFromBody(body);
      streamsWithHeros = _.concat(firstPage, secondPage);
      const usersRequestOpts = _.merge({}, usersRequest, {
        qs: {
          id: _.map(streamsWithHeros, 'user_id'),
        },
      });
      request.get(usersRequestOpts, cb);
    },
    async.asyncify((res, body) => {
      const data = JSON.parse(body).data;
      const streamsByUserId = _.keyBy(data, 'id');
      const mergedStreamData = _.map(streamsWithHeros, stream => {
        return _.extend({}, stream, streamsByUserId[stream.user_id]);
      });
      // console.dir(_.first(mergedStreamData), { depth: null });
      streamsByHero = _.groupBy(mergedStreamData, stream => {
        const hero = _.get(stream, 'overwatch.broadcaster.hero.name');
        return hero;
      });
      if (_.isEmpty(streamsByHero)) {
        return io.sockets.emit('noMetadata');
      }
      // console.log('emitting...');
      io.sockets.emit('streams', streamsByHero);
    }),
  ]);
}

getMetadata();
setInterval(getMetadata, REFRESH_RATE);

io.on('connection', socket => {
  // Add the socket to list of all sockets. Wait do you need this list? Nah...just broadcast periodically
  socket.emit('streams', streamsByHero);
});

server.listen(PORT);

// todo (frontend): allow frontend to choose whether or not to auto-switch.
// Also the backend should pass to the frontend a full list of streams for the hero
// So behavior is: when you first join you're in auto-spectate mode. If you manually choose an alternate stream or turn off auto-switch, then you're in manual mode
