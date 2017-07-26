const request = require('supertest');
const assert = require('assert');

const app = require('../app/index');

describe('integration testing', () => {
  it('should respond to GET /', () =>
    request(app)
    .get('/')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200, 'Basic page for the Werewolves game'));
});