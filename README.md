# Borrower Copilot

Borrower Copilot is a browser-based self-assessment tool designed to help Indian borrowers make better borrowing decisions before approaching a lender.

It helps a borrower answer four practical questions:

1. **Should I borrow at all?**
2. **How much can I realistically afford?**
3. **What is a fair interest rate for me?**
4. **What EMI should I agree to?**

The application also generates a **Negotiation Card** that the borrower can use when discussing a loan with a lender.

---

## Problem

Loan eligibility and affordability are often presented as the same thing.

A lender may approve an amount that is technically possible for the borrower to repay, but that does not necessarily mean it is a financially safe amount.

Borrower Copilot separates:

* **Likely lender sanction** — what a lender may potentially approve
* **Safe borrowing amount** — what the borrower should consider taking based on affordability

The goal is to help borrowers negotiate from an informed position instead of accepting the first loan offer.

---

## What Borrower Copilot Does

The application provides four main outputs.

### 1. Borrowing Decision

The application can recommend:

* **Borrow**
* **Borrow Less**
* **Don't Borrow**

The "Don't Borrow" outcome is intentionally supported because borrowing is not always the right decision.

### 2. Borrowing Amount

The application shows two separate numbers:

* Likely lender sanction
* Safe borrowing amount

The safe amount is the number the borrower should prioritize.

### 3. Fair Rate

The application provides:

* Fair interest-rate range
* Expected rate
* Processing fee
* All-in borrowing cost / APR-style view

The goal is to give the borrower a reference point for negotiating with lenders.

### 4. EMI Ceiling

The application calculates an affordable monthly EMI/outflow ceiling.

It also considers:

* Existing EMIs
* Income
* Household expenses
* Borrower type
* Loan amount
* Tenure
* Stress scenarios

The application explains the trade-off between EMI and tenure rather than showing only one EMI number.

---

## Adaptive Questions

The assessment starts with a small set of high-value questions covering:

* Loan purpose
* Amount required
* Loan type
* Monthly income
* Income type
* Existing EMIs
* Household expenses
* Age
* Credit score, if known

Additional questions are used when they can materially improve the assessment or change an output.

Different borrower profiles can therefore receive different follow-up questions.

---

## Handling Unknown Information

The application does not assume that missing information means zero or that an unknown value is automatically positive or negative.

For example:

* An unknown credit score remains unknown.
* Missing financial information reduces confidence.
* Less information results in wider estimates where appropriate.
* The application communicates uncertainty rather than presenting estimates as guaranteed lender decisions.

---

## Borrower Profiles

The application was designed and tested against three challenge borrowers.

### Priya

* Salaried software engineer
* ₹110,000 monthly net income
* Existing car EMI
* Credit score of 780
* Wants a personal loan for a wedding

The assessment should consider her existing EMI and affordability before recommending the requested amount.

### Ravi

* Self-employed kirana store owner
* Variable monthly cash income
* Owns an unencumbered shop
* No formal credit history
* Wants funding for additional stock and a delivery vehicle

The assessment considers whether a secured/business-oriented product may be more appropriate than treating the request as a standard unsecured personal loan.

### Anita

* Informal delivery rider and home tailor
* Variable income
* Two children
* Husband currently unemployed
* Multiple existing app loans
* High-cost outstanding debt
* Recent EMI bounce
* Wants an electric scooter to increase delivery income

The assessment is designed to make a **Don't Borrow** or **Borrow Less** outcome reachable when the existing debt burden and uncertainty make additional borrowing unsafe.

---

## Negotiation Card

After the assessment, Borrower Copilot produces a one-page Negotiation Card containing the key numbers a borrower can take to a lender.

The card is intended to help the borrower negotiate around:

* Recommended borrowing amount
* Safe amount
* Expected interest rate
* Fair rate range
* Processing fee
* All-in cost
* EMI ceiling
* Suitable tenure
* Stress-case affordability
* Key questions to ask the lender

The card is designed to turn the assessment into something practical that can be used during a real loan conversation.

---

## Loan Products

The rules consider different loan categories, including:

* Personal loans
* Business loans
* Loan Against Property (LAP)
* Gold loans
* Two-wheeler loans
* Home loans

Product routing depends on the purpose and borrower profile.

For example, a productive business requirement backed by suitable collateral may be considered differently from an unsecured personal expense.

---

## Affordability Approach

The application uses a FOIR-style affordability approach.

FOIR represents the portion of income that can reasonably be allocated toward debt obligations.

The rules use different affordability assumptions for different income types.

| Borrower Type | FOIR Assumption |
| ------------- | --------------: |
| Salaried      |             45% |
| Self-employed |             40% |
| Informal      |             35% |

Existing EMI obligations are considered when determining the room available for a new loan.

The exact calculation logic and assumptions are documented in `RULES.md`.

---

## Confidence and Uncertainty

Borrower Copilot avoids presenting estimates as guaranteed approvals.

Confidence can change based on the quality and completeness of the information provided.

In general:

* More reliable information → narrower estimates
* Missing information → wider estimates
* Unknown credit score → remains unknown
* Uncertain income → more conservative affordability assessment

Every major output is intended to have an understandable reason behind it.

---

## Technology

This project intentionally uses a simple browser-based architecture.

**Frontend**

* HTML
* CSS
* JavaScript

**No backend or database is required.**

The application runs entirely in the browser.

---

## Project Structure

```text
borrower-copilot/
│
├── index.html
├── style.css
├── script.js
│
├── README.md
├── RULES.md
├── THREE_RUN_THROUGHS.md
└── WALKTHROUGH.md
```

---

## How to Run

No installation or package manager is required.

### Option 1 — Open directly

Download or clone the repository and open:

```text
index.html
```

in a modern web browser.

### Option 2 — VS Code

Open the project folder in VS Code and use a local development extension such as Live Server.

The application will then run in the browser.

---

## Rules and Assumptions

The decision logic, affordability assumptions, interest-rate bands, processing fee, confidence handling, stress testing, credit-score treatment, and product-routing logic are documented separately in:

`RULES.md`

The documentation is intended to match the rules implemented in `script.js`.

---

## Three Run-Throughs

Detailed run-throughs for the three challenge borrowers are documented in:

`THREE_RUN_THROUGHS.md`

The document covers:

* Questions asked
* Why the questions matter
* Borrowing decision
* Likely lender sanction
* Safe borrowing amount
* Fair rate
* All-in cost
* EMI ceiling
* Stress case
* Negotiation Card

---

## Walkthrough

The five-minute product walkthrough is documented in:

`WALKTHROUGH.md`

The walkthrough covers:

1. The problem
2. Assessment flow
3. Adaptive questions
4. Four core outputs
5. Negotiation Card
6. Three borrower examples
7. Product decisions and trade-offs

The challenge accepts a written walkthrough as an alternative to a screen recording.

---

## Design Principles

### Borrower-first

The application is designed around what the borrower can safely afford, not only what a lender might approve.

### Explainable

Important numbers should have a clear reason behind them.

### Conservative under uncertainty

When important information is missing, the application avoids creating false precision.

### No forced borrowing

The correct answer can be to borrow less or not borrow.

### Negotiation-oriented

The final output is designed to help the borrower negotiate rather than simply display calculations.

---

## Limitations

Borrower Copilot is an educational decision-support tool, not a lender or credit-underwriting system.

It does not:

* Pull credit-bureau data
* Guarantee loan approval
* Guarantee an interest rate
* Replace a lender's underwriting process
* Store personal borrower data
* Provide regulated financial advice
* Account for every possible lender fee or product-specific condition

Actual lender pricing and approval can vary based on lender policies, documentation, credit history, income verification, collateral, and other factors.

---

## What I Would Build Next

If this were developed beyond the challenge, the next improvements would include:

* More lender/product comparisons
* Better APR and fee normalization
* More detailed income verification logic
* Scenario comparison between multiple loan offers
* Downloadable/shareable Negotiation Card
* Historical rate data
* More detailed stress testing
* Improved accessibility
* Automated testing for financial rules

---

## What I Would Cut

I would avoid adding unnecessary complexity such as:

* User accounts
* Social features
* Generic chatbot functionality
* Excessive data collection
* Features unrelated to borrowing decisions

The core product should remain focused on helping a borrower make and negotiate a safer borrowing decision.

---

## Challenge Deliverables

This repository contains the requested challenge deliverables:

* Working Borrower Copilot application
* `RULES.md`
* `THREE_RUN_THROUGHS.md`
* `WALKTHROUGH.md`
* `README.md`

---



**Next:** create `README.md` in your GitHub repo and paste this entire content into it. After that, we should do **`RULES.md`**, because that is one of the most important parts of the challenge.
```
