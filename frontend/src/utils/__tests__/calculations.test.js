import { describe, it, expect } from 'vitest';

// Note: Import actual calculation functions from your calculations.js file
// This is a template - adjust imports based on your actual implementation

describe('Financial Calculations', () => {
  describe('Portfolio Calculations', () => {
    it('should calculate total portfolio value', () => {
      const assets = [
        { quantity: 10, currentPrice: 100 },
        { quantity: 5, currentPrice: 200 },
      ];

      const total = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
      expect(total).toBe(2000);
    });

    it('should calculate portfolio allocation percentages', () => {
      const assets = [
        { name: 'Asset A', value: 1000 },
        { name: 'Asset B', value: 1500 },
      ];

      const total = assets.reduce((sum, asset) => sum + asset.value, 0);
      const percentages = assets.map((asset) => ({
        ...asset,
        percentage: (asset.value / total) * 100,
      }));

      expect(percentages[0].percentage).toBeCloseTo(40, 1);
      expect(percentages[1].percentage).toBeCloseTo(60, 1);
    });
  });

  describe('Return Calculations', () => {
    it('should calculate simple return', () => {
      const initialValue = 1000;
      const currentValue = 1200;
      const returnValue = ((currentValue - initialValue) / initialValue) * 100;

      expect(returnValue).toBe(20);
    });

    it('should calculate return with contributions', () => {
      const initialValue = 1000;
      const contributions = 500;
      const currentValue = 1800;
      const totalInvested = initialValue + contributions;
      const returnValue = ((currentValue - totalInvested) / totalInvested) * 100;

      expect(returnValue).toBeCloseTo(20, 1);
    });

    it('should handle negative returns', () => {
      const initialValue = 1000;
      const currentValue = 800;
      const returnValue = ((currentValue - initialValue) / initialValue) * 100;

      expect(returnValue).toBe(-20);
    });
  });

  describe('Average Cost Calculation', () => {
    it('should calculate weighted average cost', () => {
      const purchases = [
        { quantity: 10, price: 100 },
        { quantity: 5, price: 120 },
      ];

      const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);
      const totalCost = purchases.reduce((sum, p) => sum + p.quantity * p.price, 0);
      const avgCost = totalCost / totalQuantity;

      expect(avgCost).toBeCloseTo(106.67, 2);
    });
  });

  describe('Profit/Loss Calculation', () => {
    it('should calculate unrealized profit/loss', () => {
      const quantity = 10;
      const avgCost = 100;
      const currentPrice = 120;
      const profitLoss = (currentPrice - avgCost) * quantity;

      expect(profitLoss).toBe(200);
    });

    it('should calculate profit/loss percentage', () => {
      const avgCost = 100;
      const currentPrice = 120;
      const profitLossPercent = ((currentPrice - avgCost) / avgCost) * 100;

      expect(profitLossPercent).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero division', () => {
      const total = 0;
      const value = 100;
      const percentage = total === 0 ? 0 : (value / total) * 100;

      expect(percentage).toBe(0);
    });

    it('should handle empty arrays', () => {
      const assets = [];
      const total = assets.reduce((sum, asset) => sum + asset.value, 0);

      expect(total).toBe(0);
    });

    it('should handle null/undefined values', () => {
      const value1 = null ?? 0;
      const value2 = undefined ?? 0;

      expect(value1).toBe(0);
      expect(value2).toBe(0);
    });
  });
});
