# Borrower Copilot — Three Run-Throughs

This document records three representative borrower assessments using the challenge profiles for Priya, Ravi, and Anita.

The outputs below are taken from the working Borrower Copilot prototype. The figures are illustrative and depend on the assumptions documented in `RULES.md`.

---

## 1. Priya — Salaried Software Engineer

### Borrower profile

* Age: 29
* Employment: Salaried
* Monthly net income: ₹1,10,000
* Income stability: Stable
* Existing car EMI: ₹14,000
* Essential expenses: ₹28,000 rent plus other reported expenses
* Credit score: 780
* Purpose: Wedding
* Requested amount: ₹8,00,000
* Product: Personal loan
* Tenure: 4 years

### Assessment result

**Decision: Borrowing may be reasonable**

**Confidence: 90%**

### Key numbers

| Metric                   |     Result |
| ------------------------ | ---------: |
| Requested amount         |  ₹8,00,000 |
| Borrower-safe amount     | ₹12,08,511 |
| Potential lender ceiling | ₹12,87,260 |
| Fair interest rate       |     9%–16% |
| Estimated all-in APR     |        14% |
| Estimated EMI            |    ₹21,264 |
| Tenure                   |    4 years |
| Total interest           |  ₹2,20,672 |
| Processing fee           |    ₹16,000 |

### Why

The requested ₹8 lakh is below the calculated borrower-safe amount of ₹12,08,511.

The assessment starts with a 45% affordability limit for salaried income and also considers cash flow after essential expenses and existing EMIs. This leaves an estimated safe new EMI capacity of ₹35,500 per month.

The borrower-safe amount is presented separately from the illustrative lender ceiling. Priya is told to use the borrower-safe amount as the negotiation starting point rather than the maximum a lender might offer.

### Risk and stress

The main risk flag is existing monthly EMI commitments.

The 20% income-drop stress test shows **limited headroom**, with total EMI burden around 40% of stressed income.

### Negotiation card

Priya's card shows:

* Amount considering: ₹8,00,000
* Borrower-safe amount: ₹12,08,511
* Fair rate range: 9%–16%
* Estimated all-in APR: 14%
* Estimated EMI: ₹21,264
* Tenure: 4 years

The card prompts Priya to ask about the all-in APR, processing fee, total repayment, prepayment/foreclosure charges, final EMI, and other mandatory charges.

---

## 2. Ravi — Self-Employed Kirana Business Owner

### Borrower profile

* Age: 42
* Employment: Self-employed
* Business: Kirana store
* Business experience: 14 years
* Monthly income used: ₹40,000
* Income stability: Variable
* Existing formal loan: No
* Monthly expenses: Unknown
* Credit score: Unknown
* Bounced EMIs: Unknown
* Savings/cash buffer: Unknown
* Purpose: Business
* Requested amount: ₹15,00,000
* Collateral: Yes
* Collateral value: ₹45,00,000
* Tenure: 7 years

### Assessment result

**Decision: Borrow less**

**Confidence: 60%**

### Key numbers

| Metric                   |     Result |
| ------------------------ | ---------: |
| Requested amount         | ₹15,00,000 |
| Borrower-safe amount     |  ₹8,79,509 |
| Potential lender ceiling |  ₹9,34,446 |
| Fair interest rate       |     8%–17% |
| Estimated all-in APR     |        13% |
| Estimated EMI            |    ₹26,882 |
| Tenure                   |    7 years |
| Total interest           |  ₹7,58,076 |
| Processing fee           |    ₹30,000 |

### Product routing

Because Ravi requested a business loan above the secured-product threshold and reported collateral worth ₹45 lakh against a ₹15 lakh request, the prototype routed him to a **Property-backed loan** rather than an unsecured business loan.

The assessment explicitly notes that actual lender valuation and loan-to-value limits may differ.

### Why

Ravi's self-employed income uses a 40% affordability limit.

The calculated safe new EMI is ₹16,000 per month, producing a borrower-safe amount of ₹8,79,509.

The requested ₹15 lakh is substantially above that amount, so the prototype recommends borrowing less.

The collateral makes a secured route worth comparing, but it does not override affordability concerns.

### Risk and stress

The assessment flags:

* Total proposed EMI burden above 50% of monthly income.
* Variable income, making a fixed EMI harder to maintain during weaker months.
* Unknown credit score, widening the rate estimate.
* Requested amount above the borrower-safe amount.

The 20% income-drop stress test is **High stress**. The total EMI burden would use about 84% of stressed income.

### Negotiation card

Ravi's card shows:

* Amount considering: ₹15,00,000
* Borrower-safe amount: ₹8,79,509
* Fair rate range: 8%–17%
* Estimated all-in APR: 13%
* Estimated EMI: ₹26,882
* Tenure: 7 years

The card gives Ravi specific questions to ask the lender before signing.

---

## 3. Anita — Informal/Gig Worker

### Borrower profile

* Age: 35
* Employment: Gig/informal
* Monthly income used: ₹26,000
* Income stability: Variable
* Existing loans: Yes
* Existing EMI commitments: Significant
* Monthly expenses: Unknown
* Credit score: Unknown
* Bounced EMIs: One
* Savings/cash buffer: Unknown
* Purpose: Vehicle
* Requested amount: ₹1,50,000
* Product: Two-wheeler loan
* Tenure: 3 years

### Assessment result

**Decision: Don't borrow right now**

**Confidence: 78%**

### Key numbers

| Metric                   |    Result |
| ------------------------ | --------: |
| Requested amount         | ₹1,50,000 |
| Borrower-safe amount     |        ₹0 |
| Potential lender ceiling |        ₹0 |
| Fair interest rate       |    9%–26% |
| Estimated all-in APR     |       19% |
| Estimated EMI            |    ₹5,385 |
| Tenure                   |   3 years |
| Total interest           |   ₹43,871 |
| Processing fee           |    ₹3,000 |

### Why

The assessment finds that Anita's current income, essential expenses, and existing EMI commitments leave little or no room for another EMI.

The borrower-safe amount is therefore ₹0.

This demonstrates that the prototype can reach the required **Don't borrow** outcome instead of always producing a positive borrowing recommendation.

### Risk and stress

The assessment flags:

* Existing EMIs already consume about 135% of monthly income.
* Total proposed EMI burden is above 50% of monthly income.
* Variable income makes maintaining a fixed EMI harder during weaker months.
* Unknown credit score widens the fair-rate estimate.
* Essential expenses and existing EMIs leave little or no monthly cash flow.
* Requested amount is above the borrower-safe amount.

The 20% income-drop stress test is **High stress**, with total EMI burden around 194% of stressed income.

### Negotiation card

Anita's card shows:

* Amount considering: ₹1,50,000
* Borrower-safe amount: ₹0
* Fair rate range: 9%–26%
* Estimated all-in APR: 19%
* Estimated EMI: ₹5,385
* Tenure: 3 years

The card still provides lender questions, but the primary recommendation is not to take the requested loan under the current assumptions.

---

## Cross-Run Summary

| Borrower | Decision                    | Safe Amount | Lender Ceiling | Fair Rate | Confidence |
| -------- | --------------------------- | ----------: | -------------: | --------: | ---------: |
| Priya    | Borrowing may be reasonable |  ₹12,08,511 |     ₹12,87,260 |    9%–16% |        90% |
| Ravi     | Borrow less                 |   ₹8,79,509 |      ₹9,34,446 |    8%–17% |        60% |
| Anita    | Don't borrow right now      |          ₹0 |             ₹0 |    9%–26% |        78% |

### What these three runs demonstrate

**Priya** demonstrates a stable salaried borrower whose requested amount is within the borrower-safe range.

**Ravi** demonstrates adaptive product routing. His business purpose, large request, and sufficient collateral route him to a property-backed product, while affordability still limits the recommended borrowing amount.

**Anita** demonstrates that the system can recommend not borrowing when existing repayment pressure makes another loan unsafe.

Together, the three runs demonstrate the core Borrower Copilot principle:

> **The amount a lender may approve is not necessarily the amount a borrower should take.**

All figures are outputs of a prototype using documented assumptions. They are not lender approvals, offers, or financial advice.
