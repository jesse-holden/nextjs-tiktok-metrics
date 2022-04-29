/// <reference types="cypress"/>

describe('Navigation', () => {
  it('should navigate to the about page', () => {
    // Start from the index page
    cy.visit('/');

    cy.get('h1').contains('TikTok Metrics');
  });

  it('should navigate to the metrics page of an account', () => {
    // Start from the index page
    cy.visit('/');

    cy.get('[data-cy=username-input]').type('tiktok');
    cy.get('[data-cy=submit-button]').click();
    cy.location('pathname').should('eq', '/metrics/tiktok/tiktok');
  });

  it('should show an error for an invalid account', () => {
    // Start from the index page
    cy.visit('/');

    cy.get('[data-cy=username-input]').type('1234');
    cy.get('[data-cy=submit-button]').click();
    cy.get('[data-cy=error-message]').contains('Account does not exist');
  });
});

export {};
