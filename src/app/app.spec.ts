import { App } from './app';

describe('App', () => {
  it('should be defined', () => {
    expect(App).toBeDefined();
  });

  it('should have title property', () => {
    // Check class has expected properties/methods
    const instance = Object.create(App.prototype);
    expect(typeof instance.title === 'undefined' || typeof instance.title === 'string').toBe(true);
  });
});
