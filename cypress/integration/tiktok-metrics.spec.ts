/// <reference types="cypress"/>

describe('TikTok Metrics', () => {
  it('should show the username', () => {
    cy.visit('/metrics/tiktok/tiktok');

    cy.get('[data-cy=tiktok-displayname]').contains('TikTok');
  });

  it('should show valid metrics', () => {
    cy.visit('/metrics/tiktok/tiktok');

    cy.get('[data-cy="Total Followers"]').within(() => {
      cy.get('[data-cy=metric-value]').should(($div) => {
        expect(Number($div.text().trim().replace(/,/g, ''))).greaterThan(
          1_000_000
        );
      });
    });

    cy.get('[data-cy="Average Video Views"]').within(() => {
      cy.get('[data-cy=metric-value]').should(($div) => {
        expect(Number($div.text().trim().replace(/,/g, ''))).greaterThan(
          50_000
        );
      });
    });

    cy.get('[data-cy="Average Comments"]').within(() => {
      cy.get('[data-cy=metric-value]').should(($div) => {
        expect(Number($div.text().trim().replace(/,/g, ''))).greaterThan(1000);
      });
    });
  });
});

export {};
