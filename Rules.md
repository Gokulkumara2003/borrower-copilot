# Borrower Copilot — Rules & Assumptions

## 1. Purpose

This document describes the financial rules, assumptions, thresholds, product-routing logic, and decision rules implemented in Borrower Copilot.

The application is a prototype for borrower decision support. It does not represent a lender's actual underwriting policy or guarantee approval, pricing, or eligibility.

---

## 2. Processing Fee

| Rule                   |           Value | Why                                                            | Source                              |
| ---------------------- | --------------: | -------------------------------------------------------------- | ----------------------------------- |
| Assumed processing fee | 2% of principal | Used to estimate the borrower's all-in cost / APR-style figure | My judgement / prototype assumption |

The application calculates:

`Processing fee = Loan amount × 2%`

For example, a ₹5,00,000 loan produces an assumed processing fee of ₹10,000.

Actual lender processing fees may differ.

---

## 3. FOIR / Affordability Assumptions

The application uses a FOIR-style affordability limit.

FOIR represents the portion of monthly income that can be allocated toward total EMI obligations.

| Income Type    | FOIR | Why                                                                  | Source                              |
| -------------- | ---: | -------------------------------------------------------------------- | ----------------------------------- |
| Salaried       |  45% | Higher income predictability allows a higher affordability threshold | My judgement / prototype assumption |
| Self-employed  |  40% | Accounts for greater income variability                              | My judgement / prototype assumption |
| Informal / gig |  35% | Provides additional repayment headroom for variable income           | My judgement / prototype assumption |

The calculation starts with:

`Total EMI limit = Monthly income × FOIR`

Existing EMIs are then deducted to determine available repayment capacity.

---

## 4. Safe EMI Capacity

The borrower-safe EMI is based on the smaller of:

1. FOIR-based available EMI
2. Cash-flow-based available EMI, when essential expenses are known

FOIR available EMI:

`Income × FOIR − Existing EMI`

Cash-flow available EMI:

`Income − Essential expenses − Existing EMI`

When expenses are known, the application uses the smaller of these two values.

This is intended to avoid recommending an EMI that appears affordable under a debt-ratio calculation but leaves insufficient cash after essential expenses.

---

## 5. Age Safety Adjustments

The application applies additional safety adjustments for older borrowers.

| Age      | Adjustment |
| -------- | ---------: |
| Below 60 |       100% |
| 60–64    |        90% |
| 65+      |        75% |

These adjustments reduce the borrower-safe EMI capacity.

### Reason

A longer repayment period may create additional repayment uncertainty for older borrowers.

These are prototype assumptions and are not lender underwriting rules.

---

## 6. Medical Risk Adjustment

The current implementation contains a medical-risk safety factor.

| Medical Risk | Adjustment |
| ------------ | ---------: |
| Serious      |        85% |
| Other        |       100% |

A serious medical risk reduces the calculated safe EMI capacity.

The current assessment flow does not actively ask the medical-risk question, so this factor normally remains unused unless the state is populated elsewhere.

---

## 7. Loan Product Rate Bands

The base annual interest-rate bands are:

| Product                    | Low | High |
| -------------------------- | --: | ---: |
| Personal loan              | 11% |  18% |
| Business loan              | 13% |  20% |
| Property-backed loan / LAP |  9% |  13% |
| Home loan                  |  8% |  11% |
| Gold loan                  | 10% |  18% |
| Two-wheeler loan           | 10% |  22% |

These are prototype reference bands rather than guaranteed market quotes.

**Source:** My judgement / prototype assumptions.

Actual lender rates vary by lender, borrower profile, product, collateral, credit history, and other underwriting factors.

---

## 8. Credit Score Adjustments

The borrower is allowed to enter a credit score between 300 and 900.

The rate band changes according to the following rules.

| Credit Score | Rate Adjustment                                                 |
| ------------ | --------------------------------------------------------------- |
| 750+         | Low and high rates each decrease by 2 percentage points         |
| 700–749      | Low and high rates each decrease by 1 percentage point          |
| 650–699      | No adjustment                                                   |
| Below 650    | Low rate increases by 2 points; high rate increases by 3 points |

### Unknown Credit Score

If the borrower does not know their score:

* Low rate decreases by 1 percentage point
* High rate increases by 2 percentage points

This deliberately creates a wider range rather than treating unknown information as a poor score.

---

## 9. Repayment History Adjustments

Recent missed or bounced EMIs affect the estimated rate range.

| Repayment History        | Adjustment                              |
| ------------------------ | --------------------------------------- |
| No missed payments       | No adjustment                           |
| One missed / bounced EMI | High rate +1 percentage point           |
| Two or more              | Low rate +2 points; high rate +4 points |
| Unknown                  | No direct rate adjustment               |

Multiple missed payments therefore widen the rate range upward and can also trigger a "Don't borrow" recommendation.

---

## 10. Income Stability Adjustment

If the borrower reports significantly variable income:

`High rate +2 percentage points`

The low end of the rate range is not changed.

The purpose is to recognize that income variability can increase repayment risk.

---

## 11. Age-Based Rate Adjustment

Age can also affect the estimated rate range.

| Age      | Rate Adjustment                        |
| -------- | -------------------------------------- |
| Below 60 | No adjustment                          |
| 60–64    | High rate +1 point                     |
| 65+      | Low rate +1 point; high rate +2 points |

---

## 12. Medical-Risk Rate Adjustment

If serious medical risk is present:

`High rate +2 percentage points`

If medical risk is unknown:

`High rate +1 percentage point`

The low rate is not changed.

---

## 13. Rate Range Floor

The calculated low rate cannot fall below:

`5%`

The high rate is always forced to be at least one percentage point above the low rate.

This prevents the prototype from producing unrealistic or inverted ranges after multiple adjustments.

---

## 14. Product Routing

The application selects a loan product based primarily on the stated purpose.

| Purpose         | Default Product  |
| --------------- | ---------------- |
| Wedding         | Personal loan    |
| Medical         | Personal loan    |
| Education       | Personal loan    |
| Vehicle         | Two-wheeler loan |
| Business        | Business loan    |
| Home / Property | Home loan        |
| Other           | Personal loan    |

### Business + Collateral

For a business loan:

* If collateral is available
* The collateral value is known
* The requested amount is known
* The collateral value is at least the requested amount

the application routes the borrower to:

**Property-backed loan / LAP**

This allows a borrower with suitable collateral to compare a secured route instead of automatically using an unsecured business loan.

---

## 15. When Collateral Is Asked

The application asks about collateral when:

### Large borrowing request

`Loan amount >= ₹10,00,000`

OR

### Business borrowing request

`Business loan amount >= ₹5,00,000`

This is an adaptive question because collateral information can materially change the appropriate product route and risk assessment.

---

## 16. Borrower-Safe Amount

The borrower-safe amount is calculated by converting the adjusted safe EMI capacity into a loan amount.

The calculation uses the **high end of the applicable interest-rate band**.

This is intentionally conservative.

The safe amount therefore reflects the loan amount that could be supported by the borrower's adjusted EMI capacity under a relatively expensive rate assumption.

---

## 17. Potential Lender Ceiling

The application separately calculates an illustrative lender-style ceiling.

When existing EMI information is known:

`Available EMI = Income × FOIR − Existing EMI`

When existing EMI information is unknown:

`Available EMI = Income × FOIR × 75%`

The resulting EMI capacity is converted into a loan amount using the midpoint of the applicable rate band.

This is **not a loan approval**.

It exists to demonstrate the difference between:

**What a lender might potentially offer**

and

**What the borrower should consider taking.**

---

## 18. Borrowing Decision

The application supports three outcomes.

### Don't Borrow Right Now

This occurs when:

* There are multiple recent missed/bounced EMIs

OR

* The calculated safe amount is zero or negative

The purpose is to ensure that "don't borrow" is a real outcome rather than a hidden or unreachable state.

---

### Borrow Less

This occurs when:

* Requested amount is greater than the borrower-safe amount

OR

* Income is variable and the requested amount is greater than 80% of the safe amount

OR

* A large borrowing request has collateral coverage below the requested amount

The goal is to preserve additional repayment headroom.

---

### Borrowing May Be Reasonable

This is returned when none of the stronger warning conditions above are triggered and the requested amount is within the calculated safe range.

This does not mean the loan is guaranteed to be affordable or approved.

---

## 19. EMI Calculation

The application uses the standard reducing-balance loan EMI formula.

The monthly interest rate is:

`Annual interest rate / 12`

The EMI is calculated from:

* Principal
* Annual interest rate
* Tenure

For the proposed loan, the application uses the midpoint of the applicable fair-rate range.

---

## 20. Tenure Trade-off

The borrower can select:

* 1 year
* 2 years
* 3 years
* 4 years
* 5 years
* 7 years
* 10 years

A longer tenure generally reduces monthly EMI but increases total interest paid.

The application displays both:

* Estimated EMI
* Total interest

This helps the borrower understand the trade-off rather than optimizing only for the lowest monthly payment.

---

## 21. All-In APR Estimate

The application assumes the processing fee is deducted from the amount received by the borrower.

For example:

`Net amount received = Principal − Processing fee`

The APR-style calculation then finds the annualized rate at which the EMI cash flows correspond to the net amount received.

The calculation includes:

* Loan principal
* Interest
* Assumed 2% processing fee

It does **not** necessarily include every fee a real lender could charge.

Therefore the application calls this an:

**Estimated all-in APR**

rather than claiming it is the lender's legally disclosed APR.

---

## 22. Stress Test

The application runs a stress scenario where:

`Income falls by 20%`

The existing EMI and proposed EMI are then compared against the stressed income.

### Stress outcomes

| Total EMI / Stressed Income | Result                |
| --------------------------- | --------------------- |
| 40% or less                 | Some headroom remains |
| Above 40% and up to 50%     | Limited headroom      |
| Above 50%                   | High stress           |

If existing EMI information is unknown, the stress test is marked incomplete because the result could otherwise be overly optimistic.

---

## 23. Confidence

The application calculates an assessment confidence score based on how much borrower information is available.

The starting confidence is:

`38%`

Each answered assessment field contributes:

`+4 percentage points`

The application then applies reductions for important unknown information.

| Unknown Information  | Confidence Reduction |
| -------------------- | -------------------: |
| Existing EMI         |           -12 points |
| Essential expenses   |           -10 points |
| Credit score         |            -8 points |
| Medical risk unknown |            -5 points |

The final confidence is capped between:

`30% and 95%`

The purpose is to make uncertainty visible instead of hiding it.

---

## 24. Unknown Information

Unknown information is not automatically treated as zero.

Examples:

* Unknown expenses are not assumed to be ₹0.
* Unknown credit score is not converted into a low score.
* Unknown existing EMI reduces confidence.
* Unknown collateral prevents a secured route from being confidently assessed.

Where possible, the application widens uncertainty instead of creating false precision.

---

## 25. Existing Debt

Existing EMIs directly reduce the amount available for a new EMI.

The application also flags existing EMI commitments as a risk factor.

If existing EMIs consume at least 30% of monthly income, the application explicitly reports this as a higher debt burden.

---

## 26. Risk Factors

The application can flag:

* Higher age-related repayment risk
* Serious medical risk
* High existing EMI burden
* High total proposed EMI burden
* Variable income
* Missed or bounced EMIs
* Unknown credit score
* Low credit score
* Insufficient cash flow
* Requested amount above safe amount
* Lack of collateral for larger borrowing
* Unknown collateral position
* Insufficient stated collateral value

These are assessment flags, not lender approval rules.

---

## 27. Cash Buffer

The borrower can provide their savings or cash buffer.

When known, the application compares savings against:

`Essential expenses + existing EMI`

It then estimates how many months of these commitments the reported savings could cover.

If the savings cover less than one month, the application displays a limited-buffer warning.

If savings are unknown, the application does not assume ₹0.

---

## 28. Negotiation Card

The Negotiation Card contains:

* Amount considering
* Borrower-safe amount
* Fair rate range
* Estimated all-in APR
* Estimated EMI
* Tenure
* Processing fee assumption

It also prompts the borrower to ask the lender to confirm:

1. All-in APR
2. Processing fee
3. Total repayment amount
4. Prepayment / foreclosure charges
5. Final EMI
6. Other mandatory charges

The card's negotiation target is to ask the lender to explain additional charges and try to keep the quoted APR at or below the upper end of the estimated fair-rate range.

---

## 29. Important Limitations

Borrower Copilot is a prototype and not a lender.

The calculations do not account for every factor used in real underwriting.

Actual lending decisions can also depend on:

* Verified income
* Employment history
* Credit bureau data
* Existing liabilities
* Bank statements
* Documentation
* Collateral valuation
* Loan-to-value limits
* Lender-specific policies
* Fees and charges not represented in this prototype
* Regulatory and product-specific requirements

The application therefore provides a **decision-support estimate**, not an approval or financial guarantee.

---

## 30. Design Principle

The central principle of Borrower Copilot is:

> **The amount a lender may approve is not necessarily the amount a borrower should take.**

The application therefore prioritizes the borrower-safe amount and makes the reasoning behind the estimate visible.
