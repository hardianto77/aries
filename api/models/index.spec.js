jest.mock('@aries/data-schemas', () => ({ createMethods: jest.fn(() => ({})) }));
jest.mock('@aries/api', () => ({
  matchModelName: jest.fn(),
  findMatchingPattern: jest.fn(),
  isDeploymentSkillId: jest.fn(),
  createMessageBudgetReader: jest.fn(() => ({ getBudget: jest.fn(), initialize: jest.fn() })),
}));
jest.mock('~/cache/getLogStores', () => jest.fn());

const { createMethods } = require('@aries/data-schemas');
const { createMessageBudgetReader } = require('@aries/api');
const { initializeMessageBudget } = require('./index');
const reader = createMessageBudgetReader.mock.results[0].value;
const { getMCPAppMessageBudget } = createMethods.mock.calls[0][1];

describe('message App budget dependency wiring', () => {
  it('passes the same reader to storage and initializer to the composition root', () => {
    expect(getMCPAppMessageBudget).toBe(reader.getBudget);
    expect(initializeMessageBudget).toBe(reader.initialize);
    expect(reader.getBudget).not.toHaveBeenCalled();
  });
});
