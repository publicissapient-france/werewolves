const request = require('supertest');
const assert = require('assert');

const app = require('../app/index');

describe('integration testing', () => {
  it('should respond to GET /', () =>
    request(app)
    .get('/')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200, 'Basic page for the Werewolves game'));

  it('should respond to GET /_ah/health', () =>
    request(app)
    .get('/_ah/health')
    .expect(200));

  it.skip('should respond to POST /home', () =>
    request(app)
    .post('/home').send({
      originalRequest: {
        source: 'google',
        id: 'a931e390-7dde-4892-80d1-d5864d52fa4a',
        timestamp: '2017-07-28T14:23:54.426Z',
        lang: 'en',
        status: { code: 200, errorType: 'success' },
        sessionId: '1501251588200',
        data: {
          user: {
            userId: 1,
          },
        },
      },
      result:
        {
          source: 'agent',
          resolvedQuery: 'start the game',
          speech: '',
          action: 'CREATE_GAME',
          actionIncomplete: false,
          parameters: {},
          contexts: [],
          metadata: [],
          fulfillment: [],
          score: 1,
        },
    })
    .expect(200));
});

/*
data.user.userId
 */