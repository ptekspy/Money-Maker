import assert from "node:assert/strict";
import test from "node:test";
import {
  annualPricePenceForLimit,
  isPublicPropertyLimit,
  moneyFromPence,
  propertyLimitForAnnualPrice,
} from "./pricing.ts";

test("published portfolio packs have the agreed annual prices", () => {
  assert.equal(annualPricePenceForLimit(3), 2_800);
  assert.equal(annualPricePenceForLimit(10), 6_125);
  assert.equal(annualPricePenceForLimit(50), 23_950);
  assert.equal(annualPricePenceForLimit(100), 44_025);
});

test("properties between packs cost GBP 5 from the latest pack", () => {
  assert.equal(annualPricePenceForLimit(4), 3_300);
  assert.equal(annualPricePenceForLimit(11), 6_625);
  assert.equal(annualPricePenceForLimit(51), 24_450);
  assert.equal(annualPricePenceForLimit(101), 44_525);
  assert.equal(annualPricePenceForLimit(249), 118_525);
});

test("checkout only exposes the four published packs", () => {
  for (const limit of [3, 10, 50, 100])
    assert.equal(isPublicPropertyLimit(limit), true);
  for (const limit of [2, 4, 49, 101, 250])
    assert.equal(isPublicPropertyLimit(limit), false);
});

test("webhook price mapping restores every supported limit", () => {
  for (let limit = 3; limit <= 249; limit += 1) {
    assert.equal(
      propertyLimitForAnnualPrice(annualPricePenceForLimit(limit)),
      limit,
    );
  }
  assert.equal(propertyLimitForAnnualPrice(2_799), null);
});

test("GBP prices are rendered without losing half pounds", () => {
  assert.equal(moneyFromPence(2_800), "£28");
  assert.equal(moneyFromPence(6_125), "£61.25");
  assert.equal(moneyFromPence(23_950), "£239.50");
  assert.equal(moneyFromPence(44_025), "£440.25");
});
