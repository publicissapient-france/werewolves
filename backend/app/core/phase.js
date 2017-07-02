class Phase {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  isDay() {
    return this.state === 'DAY';
  }
}

module.exports = Phase;
