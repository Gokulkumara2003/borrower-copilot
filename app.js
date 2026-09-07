const RULES = {

    processingFee: 0.02,

    foir: {
        salaried: 0.45,
        selfEmployed: 0.40,
        informal: 0.35
    },

    rates: {
        personal: {
            low: 11,
            high: 18
        },

        business: {
            low: 13,
            high: 20
        },

        lap: {
            low: 9,
            high: 13
        },

        home: {
            low: 8,
            high: 11
        },

        gold: {
            low: 10,
            high: 18
        },

        twoWheeler: {
            low: 10,
            high: 22
        }
    },

    largeLoanThreshold: 1000000,

    businessCollateralThreshold: 500000
};

const state = {

    step: 0,

    purpose: null,

    employment: null,

    workType: null,

    businessYears: null,

    age: null,

    income: null,

    incomeStability: null,

    medicalRisk: null,

    existingLoan: null,

    existingEmi: null,

    expenses: null,

    amount: null,

    collateralAvailable: null,

    collateralValue: null,

    score: null,

    bouncedEmis: null,

    savings: null,

    tenure: null,

    product: "personal"
};

const app = document.getElementById("app");

const progress = document.getElementById("progress");

const stepText = document.getElementById("stepText");

const progressText = document.getElementById("progressText");

let steps = [];

function buildSteps() {

    steps = [

        {
            id: "purpose",
            render: renderPurpose
        },

        {
            id: "employment",
            render: renderEmployment
        },

        {
            id: "income",
            render: renderIncome
        },

        {
            id: "incomeStability",
            render: renderIncomeStability
        },

        {
            id: "age",
            render: renderAge
        },

        {
            id: "existingLoan",
            render: renderExistingLoan
        },

        {
            id: "expenses",
            render: renderExpenses
        },

        {
            id: "amount",
            render: renderAmount
        },

        {
            id: "score",
            render: renderCreditScore
        },

        {
            id: "bounces",
            render: renderBounces
        },

        {
            id: "savings",
            render: renderSavings
        },

        {
            id: "tenure",
            render: renderTenure
        },

        {
            id: "result",
            render: renderResult
        }

    ];

}

function money(value) {

    if (
        value === null ||
        value === undefined ||
        isNaN(value)
    ) {

        return "Unknown";

    }

    return "₹" +
        Math.round(value).toLocaleString("en-IN");

}

function percent(value) {

    return Math.round(value) + "%";

}

function getEmploymentCategory() {

    if (state.employment === "working") {

        return "salaried";

    }

    if (state.employment === "self") {

        return "selfEmployed";

    }

    return "informal";

}

function getFOIR() {

    return RULES.foir[
        getEmploymentCategory()
    ];

}

function productName() {

    const names = {

        personal: "Personal loan",

        business: "Business loan",

        lap: "Property-backed loan",

        home: "Home loan",

        gold: "Gold loan",

        twoWheeler: "Two-wheeler loan"

    };

    return names[state.product] || "Loan";

}

function getPurposeName() {

    const names = {

        wedding: "Wedding",

        medical: "Medical",

        education: "Education",

        vehicle: "Vehicle",

        business: "Business",

        home: "Home / Property",

        other: "Other"

    };

    return names[state.purpose] || "Other";

}

function determineProduct() {

    if (state.purpose === "wedding") {

        state.product = "personal";

    }

    else if (state.purpose === "medical") {

        state.product = "personal";

    }

    else if (state.purpose === "education") {

        state.product = "personal";

    }

    else if (state.purpose === "vehicle") {

        state.product = "twoWheeler";

    }

    else if (state.purpose === "business") {

        state.product = "business";

        if (
            state.collateralAvailable === "yes" &&
            state.collateralValue !== null &&
            state.amount !== null &&
            state.collateralValue >= state.amount
        ) {

            state.product = "lap";

        }

    }

    else if (state.purpose === "home") {

        state.product = "home";

    }

    else {

        state.product = "personal";

    }

}

function calculateEmi(
    principal,
    annualRate,
    years
) {

    const months = years * 12;

    const monthlyRate =
        annualRate / 100 / 12;

    if (monthlyRate === 0) {

        return principal / months;

    }

    return principal *
        monthlyRate *
        Math.pow(
            1 + monthlyRate,
            months
        ) /
        (
            Math.pow(
                1 + monthlyRate,
                months
            ) - 1
        );

}

function loanFromEmi(
    emi,
    annualRate,
    years
) {

    if (
        emi === null ||
        annualRate === null ||
        years === null
    ) {

        return null;

    }

    const months = years * 12;

    const monthlyRate =
        annualRate / 100 / 12;

    if (monthlyRate === 0) {

        return emi * months;

    }

    return emi *
        (
            (
                1 -
                Math.pow(
                    1 + monthlyRate,
                    -months
                )
            ) /
            monthlyRate
        );

}

function getAgeSafetyFactor() {

    if (state.age === null) {

        return 1;

    }

    if (state.age >= 65) {

        return 0.75;

    }

    if (state.age >= 60) {

        return 0.90;

    }

    return 1;

}

function getMedicalSafetyFactor() {

    if (state.medicalRisk === "serious") {

        return 0.85;

    }

    return 1;

}

function getSafeEmiCapacity() {

    if (
        state.income === null ||
        state.existingEmi === null
    ) {

        return null;

    }

    const totalEmiLimit =
        state.income * getFOIR();

    const foirAvailableEmi =
        totalEmiLimit -
        state.existingEmi;

    let availableEmi;

    if (state.expenses !== null) {

        const cashFlowAvailableEmi =
            state.income -
            state.expenses -
            state.existingEmi;

        availableEmi =
            Math.min(
                foirAvailableEmi,
                cashFlowAvailableEmi
            );

    }

    else {

        availableEmi =
            foirAvailableEmi;

    }

    if (availableEmi <= 0) {

        return {

            base: availableEmi,

            adjusted: 0,

            ageFactor:
                getAgeSafetyFactor(),

            medicalFactor:
                getMedicalSafetyFactor()

        };

    }

    const ageFactor =
        getAgeSafetyFactor();

    const medicalFactor =
        getMedicalSafetyFactor();

    const adjusted =
        availableEmi *
        ageFactor *
        medicalFactor;

    return {

        base: availableEmi,

        adjusted: adjusted,

        ageFactor: ageFactor,

        medicalFactor: medicalFactor

    };

}

function calculateSafeAmount() {

    const capacity =
        getSafeEmiCapacity();

    if (capacity === null) {

        return null;

    }

    if (capacity.adjusted <= 0) {

        return 0;

    }

    const rates =
        RULES.rates[state.product];

    return loanFromEmi(
        capacity.adjusted,
        rates.high,
        state.tenure
    );

}

function calculateLenderCeiling() {

    if (state.income === null) {

        return null;

    }

    const totalEmiLimit =
        state.income *
        getFOIR();

    let availableEmi;

    if (state.existingEmi === null) {

        availableEmi =
            totalEmiLimit * 0.75;

    }

    else {

        availableEmi =
            totalEmiLimit -
            state.existingEmi;

    }

    if (availableEmi <= 0) {

        return 0;

    }

    const rates =
        RULES.rates[state.product];

    const midpoint =
        (
            rates.low +
            rates.high
        ) / 2;

    return loanFromEmi(
        availableEmi,
        midpoint,
        state.tenure
    );

}

function getRateBand() {

    const base =
        RULES.rates[state.product];

    let low = base.low;

    let high = base.high;

    if (state.score !== null) {

        if (state.score >= 750) {

            low -= 2;
            high -= 2;

        }

        else if (state.score >= 700) {

            low -= 1;
            high -= 1;

        }

        else if (state.score < 650) {

            low += 2;
            high += 3;

        }

    }

    else {

        low -= 1;

        high += 2;

    }

    if (state.bouncedEmis === "one") {

        high += 1;

    }

    else if (
        state.bouncedEmis === "multiple"
    ) {

        low += 2;

        high += 4;

    }

    if (
        state.incomeStability === "variable"
    ) {

        high += 2;

    }

    if (state.age !== null) {

        if (state.age >= 65) {

            low += 1;

            high += 2;

        }

        else if (state.age >= 60) {

            high += 1;

        }

    }

    if (
        state.medicalRisk === "serious"
    ) {

        high += 2;

    }

    else if (
        state.medicalRisk === "unknown"
    ) {

        high += 1;

    }

    low = Math.max(5, low);

    high = Math.max(
        low + 1,
        high
    );

    return {

        low,

        high

    };

}

function calculateAPR(
    principal,
    annualRate,
    years,
    feeRate
) {

    const fee =
        principal * feeRate;

    const received =
        principal - fee;

    const emi =
        calculateEmi(
            principal,
            annualRate,
            years
        );

    const months =
        years * 12;

    let low = 0;

    let high = 100;

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const mid =
            (low + high) / 2;

        const monthlyRate =
            mid / 100 / 12;

        let presentValue;

        if (monthlyRate === 0) {

            presentValue =
                emi * months;

        }

        else {

            presentValue =
                emi *
                (
                    (
                        1 -
                        Math.pow(
                            1 + monthlyRate,
                            -months
                        )
                    ) /
                    monthlyRate
                );

        }

        if (
            presentValue >
            received
        ) {

            low = mid;

        }

        else {

            high = mid;

        }

    }

    return (low + high) / 2;

}

function shouldAskCollateral() {

    if (state.amount === null) {

        return false;

    }

    if (
        state.amount >=
        RULES.largeLoanThreshold
    ) {

        return true;

    }

    if (
        state.purpose === "business" &&
        state.amount >=
        RULES.businessCollateralThreshold
    ) {

        return true;

    }

    return false;

}

function renderQuestion(
    title,
    subtitle,
    content,
    kicker = "BORROWER COPILOT"
) {

    app.innerHTML = `

        <div class="question-card">

            <div class="question-kicker">
                ✦ ${kicker}
            </div>

            <h1>
                ${title}
            </h1>

            <p class="subtitle">
                ${subtitle}
            </p>

            <div class="question-content">
                ${content}
            </div>

            <div class="question-tip">
                <span>ⓘ</span>
                <span>
                    Your answer changes the assessment.
                    We never treat “I don't know” as zero.
                </span>
            </div>

        </div>

    `;

}

function renderPurpose() {

    renderQuestion(

        "What do you need the money for?",

        "Your purpose helps us identify which borrowing route is most relevant.",

        `

        <div class="options">

            <button onclick="selectPurpose('wedding')">
                💍 &nbsp; Wedding
            </button>

            <button onclick="selectPurpose('medical')">
                🏥 &nbsp; Medical
            </button>

            <button onclick="selectPurpose('education')">
                🎓 &nbsp; Education
            </button>

            <button onclick="selectPurpose('vehicle')">
                🛵 &nbsp; Vehicle
            </button>

            <button onclick="selectPurpose('business')">
                🏪 &nbsp; Business
            </button>

            <button onclick="selectPurpose('home')">
                🏠 &nbsp; Home / Property
            </button>

            <button onclick="selectPurpose('other')">
                ✦ &nbsp; Something else
            </button>

        </div>

        `,

        "STEP 1 OF YOUR ASSESSMENT"

    );

}

function selectPurpose(value) {

    state.purpose = value;

    determineProduct();

    next();

}

function renderEmployment() {

    renderQuestion(

        "How do you earn your income?",

        "This helps us choose an appropriate repayment affordability threshold.",

        `

        <div class="options">

            <button onclick="selectEmployment('working')">
                <strong>Salaried</strong><br>
                <small>Regular monthly salary</small>
            </button>

            <button onclick="selectEmployment('self')">
                <strong>Self-employed</strong><br>
                <small>Business or professional income</small>
            </button>

            <button onclick="selectEmployment('informal')">
                <strong>Gig / informal</strong><br>
                <small>Variable or daily income</small>
            </button>

        </div>

        `,

        "STEP 2 OF YOUR ASSESSMENT"

    );

}

function selectEmployment(value) {

    state.employment = value;

    next();

}

function renderIncome() {

    renderQuestion(

        "What is your average monthly income?",

        "Use a realistic average. If your income changes, don't use your best month.",

        `

        <div class="input-prefix">

            <span>₹</span>

            <input
                id="income"
                type="number"
                min="1"
                placeholder="e.g. 50000"
            >

        </div>

        <button
            class="primary-btn"
            onclick="continueIncome()"
        >
            Continue →
        </button>

        `,

        "INCOME"

    );

}

function continueIncome() {

    const input =
        document.getElementById("income");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value <= 0
    ) {

        input.focus();

        return;

    }

    state.income = value;

    next();

}

function renderIncomeStability() {

    renderQuestion(

        "How predictable is your income?",

        "A variable income means we keep more repayment headroom.",

        `

        <div class="options">

            <button onclick="selectIncomeStability('stable')">
                ✓ &nbsp; Stable / predictable
            </button>

            <button onclick="selectIncomeStability('variable')">
                ↕ &nbsp; Changes significantly
            </button>

        </div>

        `,

        "INCOME STABILITY"

    );

}

function selectIncomeStability(value) {

    state.incomeStability = value;

    next();

}

function renderAge() {

    renderQuestion(

        "How old are you?",

        "Age can affect how much repayment risk is reasonable, especially with longer tenures.",

        `

        <input
            id="age"
            type="number"
            min="18"
            max="100"
            placeholder="e.g. 35"
        >

        <button
            class="primary-btn"
            onclick="continueAge()"
        >
            Continue →
        </button>

        `,

        "YOUR PROFILE"

    );

}

function continueAge() {

    const input =
        document.getElementById("age");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value < 18 ||
        value > 100
    ) {

        input.focus();

        return;

    }

    state.age = value;

    next();

}

function renderExistingLoan() {

    renderQuestion(

        "Do you already have any loans or EMIs?",

        "Existing commitments directly reduce how much new EMI you can safely take on.",

        `

        <div class="options">

            <button onclick="selectExistingLoan('no')">
                No existing loans
            </button>

            <button onclick="selectExistingLoan('yes')">
                Yes, I have EMIs
            </button>

            <button onclick="selectExistingLoan('unknown')">
                I don't know
            </button>

        </div>

        `,

        "EXISTING COMMITMENTS"

    );

}

function selectExistingLoan(value) {

    state.existingLoan = value;

    if (value === "yes") {

        insertAfterCurrent({
            id: "existingEmi",
            render: renderExistingEmi
        });

    }

    else if (value === "no") {

        state.existingEmi = 0;

    }

    else {

        state.existingEmi = null;

    }

    next();

}

function renderExistingEmi() {

    renderQuestion(

        "How much do you pay in EMIs each month?",

        "Add all your current loan EMIs together.",

        `

        <div class="input-prefix">

            <span>₹</span>

            <input
                id="existingEmi"
                type="number"
                min="0"
                placeholder="e.g. 14000"
            >

        </div>

        <button
            class="primary-btn"
            onclick="continueExistingEmi()"
        >
            Continue →
        </button>

        `,

        "EXISTING DEBT"

    );

}

function continueExistingEmi() {

    const input =
        document.getElementById("existingEmi");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value < 0
    ) {

        input.focus();

        return;

    }

    state.existingEmi = value;

    next();

}

function renderExpenses() {

    renderQuestion(

        "What are your essential monthly expenses?",

        "Include rent, food, utilities, school, transport and other essentials. Exclude loan EMIs.",

        `

        <div class="input-prefix">

            <span>₹</span>

            <input
                id="expenses"
                type="number"
                min="0"
                placeholder="e.g. 30000"
            >

        </div>

        <button
            class="secondary-btn"
            onclick="skipExpenses()"
        >
            I don't know
        </button>

        <button
            class="primary-btn"
            onclick="continueExpenses()"
        >
            Continue →
        </button>

        `,

        "MONTHLY OUTGO"

    );

}

function continueExpenses() {

    const input =
        document.getElementById("expenses");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value < 0
    ) {

        input.focus();

        return;

    }

    state.expenses = value;

    next();

}

function skipExpenses() {

    state.expenses = null;

    next();

}

function renderAmount() {

    renderQuestion(

        "How much do you want to borrow?",

        "We'll compare your request with your income, expenses, existing EMIs and borrower-safe repayment capacity.",

        `

        <div class="input-prefix">

            <span>₹</span>

            <input
                id="amount"
                type="number"
                min="1000"
                step="1000"
                placeholder="e.g. 800000"
            >

        </div>

        <button
            class="primary-btn"
            onclick="continueAmount()"
        >
            Continue →
        </button>

        `,

        "LOAN AMOUNT"

    );

}

function continueAmount() {

    const input =
        document.getElementById("amount");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value < 1000
    ) {

        input.focus();

        return;

    }

    state.amount = value;

    determineProduct();

    if (shouldAskCollateral()) {

        insertAfterCurrent({
            id: "collateral",
            render: renderCollateral
        });

    }

    next();

}

function renderCollateral() {

    renderQuestion(

        "Do you have an asset that could potentially be used as collateral?",

        "For larger borrowing requests, this helps us compare unsecured and secured routes.",

        `

        <div class="options">

            <button onclick="selectCollateral('yes')">
                Yes, I have an asset
            </button>

            <button onclick="selectCollateral('no')">
                No collateral
            </button>

            <button onclick="selectCollateral('unknown')">
                I don't know
            </button>

        </div>

        `,

        "SECURED BORROWING CHECK"

    );

}

function selectCollateral(value) {

    state.collateralAvailable = value;

    if (value === "yes") {

        insertAfterCurrent({
            id: "collateralValue",
            render: renderCollateralValue
        });

    }

    else {

        state.collateralValue = null;

    }

    next();

}

function renderCollateralValue() {

    renderQuestion(

        "What is the approximate value of the asset?",

        "Use a realistic current estimate. A lender's valuation and loan-to-value limit may differ.",

        `

        <div class="input-prefix">

            <span>₹</span>

            <input
                id="collateralValue"
                type="number"
                min="1"
                placeholder="e.g. 4500000"
            >

        </div>

        <button
            class="primary-btn"
            onclick="continueCollateralValue()"
        >
            Continue →
        </button>

        `,

        "COLLATERAL VALUE"

    );

}

function continueCollateralValue() {

    const input =
        document.getElementById("collateralValue");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value <= 0
    ) {

        input.focus();

        return;

    }

    state.collateralValue = value;

    determineProduct();

    next();

}

function renderCreditScore() {

    renderQuestion(

        "Do you know your credit score?",

        "Don't guess. If you don't know it, your fair-rate range will simply be wider.",

        `

        <input
            id="score"
            type="number"
            min="300"
            max="900"
            placeholder="e.g. 780"
        >

        <button
            class="secondary-btn"
            onclick="skipCreditScore()"
        >
            I don't know
        </button>

        <button
            class="primary-btn"
            onclick="continueCreditScore()"
        >
            Continue →
        </button>

        `,

        "CREDIT PROFILE"

    );

}

function continueCreditScore() {

    const input =
        document.getElementById("score");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value < 300 ||
        value > 900
    ) {

        input.focus();

        return;

    }

    state.score = value;

    next();

}

function skipCreditScore() {

    state.score = null;

    next();

}

function renderBounces() {

    renderQuestion(

        "Have you missed or bounced an EMI recently?",

        "This can affect both repayment risk and the rate a lender may offer.",

        `

        <div class="options">

            <button onclick="selectBounces('none')">
                ✓ &nbsp; No missed payments
            </button>

            <button onclick="selectBounces('one')">
                ⚠ &nbsp; 1 missed / bounced EMI
            </button>

            <button onclick="selectBounces('multiple')">
                ⚠ &nbsp; 2 or more
            </button>

            <button onclick="selectBounces('unknown')">
                I don't know
            </button>

        </div>

        `,

        "REPAYMENT HISTORY"

    );

}

function selectBounces(value) {

    state.bouncedEmis = value;

    next();

}

function renderSavings() {

    renderQuestion(

        "How much savings or cash buffer do you have?",

        "A cash buffer can help you handle unexpected expenses without missing an EMI.",

        `

        <div class="input-prefix">

            <span>₹</span>

            <input
                id="savings"
                type="number"
                min="0"
                placeholder="e.g. 100000"
            >

        </div>

        <button
            class="secondary-btn"
            onclick="skipSavings()"
        >
            I don't know
        </button>

        <button
            class="primary-btn"
            onclick="continueSavings()"
        >
            Continue →
        </button>

        `,

        "CASH BUFFER"

    );

}

function continueSavings() {

    const input =
        document.getElementById("savings");

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value < 0
    ) {

        input.focus();

        return;

    }

    state.savings = value;

    next();

}

function skipSavings() {

    state.savings = null;

    next();

}

function renderTenure() {

    renderQuestion(

        "How long do you want to repay?",

        "A longer tenure reduces the EMI but generally increases the total interest you pay.",

        `

        <div class="options">

            <button onclick="selectTenure(1)">
                1 year
            </button>

            <button onclick="selectTenure(2)">
                2 years
            </button>

            <button onclick="selectTenure(3)">
                3 years
            </button>

            <button onclick="selectTenure(4)">
                4 years
            </button>

            <button onclick="selectTenure(5)">
                5 years
            </button>

            <button onclick="selectTenure(7)">
                7 years
            </button>

            <button onclick="selectTenure(10)">
                10 years
            </button>

        </div>

        `,

        "REPAYMENT PLAN"

    );

}

function selectTenure(value) {

    state.tenure = value;

    next();

}

function getRiskFactors(
    safeAmount,
    proposedEmi
) {

    const risks = [];

    if (
        state.age !== null &&
        state.age >= 65
    ) {

        risks.push(
            "Higher age-related repayment risk: a long repayment period may be less suitable."
        );

    }

    else if (
        state.age !== null &&
        state.age >= 60
    ) {

        risks.push(
            "Age-related repayment risk should be considered when choosing the tenure."
        );

    }

    if (
        state.medicalRisk === "serious"
    ) {

        risks.push(
            "A current medical issue may affect future income or essential expenses."
        );

    }

    if (
        state.existingEmi !== null &&
        state.income !== null &&
        state.existingEmi > 0
    ) {

        const ratio =
            state.existingEmi /
            state.income *
            100;

        if (ratio >= 30) {

            risks.push(
                "Existing EMIs already consume about " +
                Math.round(ratio) +
                "% of monthly income."
            );

        }

        else {

            risks.push(
                "You already have monthly EMI commitments."
            );

        }

    }

    if (
        proposedEmi !== null &&
        state.income !== null
    ) {

        const totalEmi =
            state.existingEmi === null
                ? proposedEmi
                : state.existingEmi + proposedEmi;

        const ratio =
            totalEmi /
            state.income *
            100;

        if (ratio > 50) {

            risks.push(
                "Total proposed EMI burden is above 50% of monthly income."
            );

        }

        else if (
            ratio >
            getFOIR() * 100
        ) {

            risks.push(
                "Total proposed EMI burden is above the affordability threshold used here."
            );

        }

    }

    if (
        state.incomeStability === "variable"
    ) {

        risks.push(
            "Income varies significantly, so maintaining a fixed EMI may be harder during weaker months."
        );

    }

    if (
        state.bouncedEmis === "one"
    ) {

        risks.push(
            "One recent missed or bounced EMI may make lenders more cautious."
        );

    }

    else if (
        state.bouncedEmis === "multiple"
    ) {

        risks.push(
            "Multiple missed or bounced EMIs indicate a higher repayment-risk pattern."
        );

    }

    if (
        state.score === null
    ) {

        risks.push(
            "Credit score is unknown, so the fair-rate estimate has been widened."
        );

    }

    else if (
        state.score < 650
    ) {

        risks.push(
            "Lower credit score may reduce lender options or increase the offered rate."
        );

    }

    if (
        state.expenses !== null &&
        state.income !== null
    ) {

        const remaining =
            state.income -
            state.expenses -
            (
                state.existingEmi === null
                    ? 0
                    : state.existingEmi
            );

        if (remaining <= 0) {

            risks.push(
                "Essential expenses and existing EMIs leave little or no monthly cash flow."
            );

        }

    }

    if (
        safeAmount !== null &&
        state.amount !== null &&
        state.amount > safeAmount
    ) {

        risks.push(
            "Requested loan amount is above the borrower-safe amount calculated from current cash flow and debt."
        );

    }

    if (
        shouldAskCollateral()
    ) {

        if (
            state.collateralAvailable === "no"
        ) {

            risks.push(
                "No collateral is available for this larger borrowing request."
            );

        }

        else if (
            state.collateralAvailable === "unknown"
        ) {

            risks.push(
                "Collateral position is unknown, so a secured route cannot be assessed."
            );

        }

        else if (
            state.collateralValue !== null &&
            state.amount !== null &&
            state.collateralValue < state.amount
        ) {

            risks.push(
                "Stated collateral value is below the requested loan amount."
            );

        }

    }

    return risks;

}

function getDecision(safeAmount) {

    if (
        state.bouncedEmis === "multiple"
    ) {

        return {

            title: "Don't borrow right now",

            className: "danger",

            reason:
                "Multiple recent missed or bounced EMIs suggest that another repayment could increase financial stress."

        };

    }

    if (
        safeAmount !== null &&
        safeAmount <= 0
    ) {

        return {

            title: "Don't borrow right now",

            className: "danger",

            reason:
                "Your current income, essential expenses and existing EMIs do not leave enough room for a new loan payment."

        };

    }

    if (
        safeAmount !== null &&
        state.amount > safeAmount
    ) {

        return {

            title: "Borrow less",

            className: "warning",

            reason:
                "The amount you requested is above the borrower-safe amount calculated from your current repayment capacity."

        };

    }

    if (
        state.incomeStability === "variable" &&
        safeAmount !== null &&
        state.amount > safeAmount * 0.8
    ) {

        return {

            title: "Borrow less",

            className: "warning",

            reason:
                "Your income varies significantly, so keeping more monthly repayment headroom would reduce risk."

        };

    }

    if (
        shouldAskCollateral() &&
        state.collateralAvailable === "yes" &&
        state.collateralValue !== null &&
        state.collateralValue < state.amount
    ) {

        return {

            title: "Borrow less",

            className: "warning",

            reason:
                "Your requested amount is higher than the collateral value you provided. A smaller amount or different borrowing structure may be safer."

        };

    }

    return {

        title: "Borrowing may be reasonable",

        className: "good",

        reason:
            "Your requested amount is within the borrower-safe range under the assumptions used in this assessment."

    };

}

function calculateConfidence() {

    const fields = [

        state.purpose,
        state.employment,
        state.age,
        state.income,
        state.incomeStability,
        state.existingLoan,
        state.existingEmi,
        state.expenses,
        state.amount,
        state.score,
        state.bouncedEmis,
        state.savings,
        state.tenure

    ];

    let answered = 0;

    fields.forEach(value => {

        if (
            value !== null &&
            value !== undefined
        ) {

            answered++;

        }

    });

    let confidence =
        38 +
        answered * 4;

    if (
        state.existingEmi === null
    ) {

        confidence -= 12;

    }

    if (
        state.expenses === null
    ) {

        confidence -= 10;

    }

    if (
        state.score === null
    ) {

        confidence -= 8;

    }

    if (
        state.medicalRisk === "unknown"
    ) {

        confidence -= 5;

    }

    return Math.max(
        30,
        Math.min(
            95,
            confidence
        )
    );

}

function getAmountWhy(safeAmount) {

    if (safeAmount === null) {

        return "We need your existing EMI information before we can calculate a reliable borrower-safe amount.";

    }

    const capacity =
        getSafeEmiCapacity();

    if (capacity === null) {

        return "The available information is not sufficient to calculate a reliable safe amount.";

    }

    if (safeAmount <= 0) {

        return "Your current income, essential expenses and existing EMI commitments leave little or no room for another EMI.";

    }

    let text =
        "We start with your monthly income and a " +
        Math.round(getFOIR() * 100) +
        "% affordability limit for your income type.";

    if (
        state.expenses !== null
    ) {

        text +=
            " We also compare this with the cash left after essential expenses and existing EMIs.";

    }

    if (
        capacity.ageFactor < 1
    ) {

        text +=
            " An age-related safety adjustment keeps additional repayment headroom.";

    }

    if (
        capacity.medicalFactor < 1
    ) {

        text +=
            " A medical-risk adjustment keeps additional headroom for uncertainty.";

    }

    text +=
        " This leaves an estimated safe new EMI of " +
        money(capacity.adjusted) +
        " per month.";

    return text;

}

function getStressResult(proposedEmi) {

    if (
        state.income === null ||
        proposedEmi === null
    ) {

        return {

            title: "Stress test unavailable",

            text:
                "Income or proposed EMI is unknown, so the stress case cannot be calculated reliably.",

            className: "warning"

        };

    }

    const stressedIncome =
        state.income * 0.8;

    if (state.existingEmi === null) {

        return {

            title: "Incomplete stress test",

            text:
                "After a 20% income drop, the proposed EMI can be assessed, but existing EMI commitments are unknown. The result may therefore be optimistic.",

            className: "warning"

        };

    }

    const totalEmi =
        state.existingEmi +
        proposedEmi;

    const ratio =
        totalEmi /
        stressedIncome *
        100;

    if (ratio > 50) {

        return {

            title: "High stress",

            text:
                "If income falls by 20%, your total EMI burden would use about " +
                Math.round(ratio) +
                "% of stressed income.",

            className: "danger"

        };

    }

    if (ratio > 40) {

        return {

            title: "Limited headroom",

            text:
                "After a 20% income drop, your total EMI burden would be around " +
                Math.round(ratio) +
                "% of stressed income.",

            className: "warning"

        };

    }

    return {

        title: "Some headroom remains",

        text:
            "After a 20% income drop, your total EMI burden would be around " +
            Math.round(ratio) +
            "% of stressed income.",

        className: "good"

    };

}

function renderCollateralResult() {

    if (!shouldAskCollateral()) {

        return "";

    }

    let content = "";

    if (
        state.collateralAvailable === "no"
    ) {

        content = `

            <div class="risk-warning">

                <strong>
                    No collateral provided
                </strong>

                <p>
                    Compare the unsecured repayment burden carefully
                    for this larger borrowing request.
                </p>

            </div>

        `;

    }

    else if (
        state.collateralAvailable === "unknown"
    ) {

        content = `

            <div class="warning-box">

                <strong>
                    Collateral position is unknown
                </strong>

                <p>
                    A secured route cannot be assessed without
                    knowing the collateral position.
                </p>

            </div>

        `;

    }

    else if (
        state.collateralValue !== null &&
        state.amount !== null
    ) {

        if (
            state.collateralValue < state.amount
        ) {

            content = `

                <div class="risk-warning">

                    <strong>
                        Collateral coverage warning
                    </strong>

                    <p>
                        You stated collateral of
                        <strong>
                            ${money(state.collateralValue)}
                        </strong>
                        against a requested
                        <strong>
                            ${money(state.amount)}
                        </strong>.
                    </p>

                    <p>
                        The requested amount is higher than
                        the stated asset value.
                    </p>

                </div>

            `;

        }

        else {

            content = `

                <div class="risk-good">

                    ✓ Your stated collateral value is
                    ${money(state.collateralValue)}.

                    <p>
                        A secured/property-backed route may be
                        worth comparing. Actual lender valuation
                        and loan-to-value limits can differ.
                    </p>

                </div>

            `;

        }

    }

    return `

        <div class="result-card">

            <div class="card-label">
                COLLATERAL CHECK
            </div>

            ${content}

        </div>

    `;

}

function renderSavingsResult() {

    if (state.savings === null) {

        return `

            <div class="result-card">

                <div class="card-label">
                    CASH BUFFER
                </div>

                <p>
                    Your savings buffer is unknown.
                    We have not assumed that it is ₹0,
                    but this makes the assessment less certain.
                </p>

            </div>

        `;

    }

    const monthlyEssential =
        state.expenses === null
            ? 0
            : state.expenses;

    const existing =
        state.existingEmi === null
            ? 0
            : state.existingEmi;

    const monthlyNeed =
        monthlyEssential +
        existing;

    if (monthlyNeed <= 0) {

        return `

            <div class="result-card">

                <div class="card-label">
                    CASH BUFFER
                </div>

                <p>
                    You reported
                    ${money(state.savings)}
                    in savings/cash buffer.
                </p>

            </div>

        `;

    }

    const months =
        state.savings /
        monthlyNeed;

    if (months < 1) {

        return `

            <div class="result-card warning">

                <div class="card-label">
                    CASH BUFFER
                </div>

                <h2>
                    Limited buffer
                </h2>

                <p>
                    Your reported savings cover less than
                    one month of essential expenses and
                    existing EMI commitments.
                </p>

            </div>

        `;

    }

    return `

        <div class="result-card">

            <div class="card-label">
                CASH BUFFER
            </div>

            <h2>
                About ${months.toFixed(1)} months
            </h2>

            <p>
                Your reported savings of
                ${money(state.savings)}
                are approximately
                ${months.toFixed(1)}
                months of essential expenses and
                existing EMI commitments.
            </p>

        </div>

    `;

}

function renderNegotiationCard(
    rates,
    apr,
    proposedEmi
) {

    return `

        <div
            class="negotiation-card"
            id="negotiationCard"
        >

            <div class="card-label">
                LOKTA AI · NEGOTIATION CARD
            </div>

            <h2>
                Take this with you to the lender.
            </h2>

            <div class="negotiation-grid">

                <div>
                    <span>Amount considering</span>

                    <strong>
                        ${money(state.amount)}
                    </strong>
                </div>

                <div>
                    <span>Borrower-safe amount</span>

                    <strong>
                        ${money(
                            calculateSafeAmount()
                        )}
                    </strong>
                </div>

                <div>
                    <span>Fair rate range</span>

                    <strong>
                        ${percent(rates.low)}
                        –
                        ${percent(rates.high)}
                    </strong>
                </div>

                <div>
                    <span>Estimated all-in APR</span>

                    <strong>
                        ${
                            apr === null
                                ? "Unknown"
                                : percent(apr)
                        }
                    </strong>
                </div>

                <div>
                    <span>Estimated EMI</span>

                    <strong>
                        ${money(proposedEmi)}
                    </strong>
                </div>

                <div>
                    <span>Tenure</span>

                    <strong>
                        ${state.tenure} years
                    </strong>
                </div>

            </div>

            <div class="negotiation-questions">

                <h3>
                    Before signing, ask:
                </h3>

                <ul>

                    <li>
                        Show me the all-in APR.
                    </li>

                    <li>
                        Confirm the processing fee.
                    </li>

                    <li>
                        Show me the total repayment amount.
                    </li>

                    <li>
                        Confirm prepayment / foreclosure charges.
                    </li>

                    <li>
                        Confirm the final EMI.
                    </li>

                    <li>
                        Show all other mandatory charges.
                    </li>

                </ul>

            </div>

            <div class="target-rate">

                <strong>
                    Negotiation target:
                </strong>

                Ask the lender to explain every additional
                charge and try to keep the quoted APR at or
                below the upper end of your fair-rate range.

            </div>

        </div>

    `;

}

function renderResult() {

    determineProduct();

    const safeAmount =
        calculateSafeAmount();

    const lenderCeiling =
        calculateLenderCeiling();

    const rates =
        getRateBand();

    let proposedEmi = null;

    let totalInterest = null;

    let apr = null;

    if (
        state.amount !== null &&
        state.tenure !== null
    ) {

        const midpointRate =
            (
                rates.low +
                rates.high
            ) / 2;

        proposedEmi =
            calculateEmi(
                state.amount,
                midpointRate,
                state.tenure
            );

        totalInterest =
            proposedEmi *
            state.tenure *
            12 -
            state.amount;

        apr =
            calculateAPR(
                state.amount,
                midpointRate,
                state.tenure,
                RULES.processingFee
            );

    }

    const decision =
        getDecision(safeAmount);

    const stress =
        getStressResult(proposedEmi);

    const confidence =
        calculateConfidence();

    const risks =
        getRiskFactors(
            safeAmount,
            proposedEmi
        );

    app.innerHTML = `

        <div class="results">

            <div class="result-header">

                <div class="eyebrow">
                    LOKTA AI · BORROWER ASSESSMENT
                </div>

                <h1>
                    ${decision.title}
                </h1>

                <p>
                    ${decision.reason}
                </p>

                <div class="confidence">
                    Assessment confidence:
                    <strong>
                        ${confidence}%
                    </strong>
                </div>

            </div>

            <div class="result-card highlight">

                <div class="card-label">
                    BORROWER-SAFE AMOUNT
                </div>

                <div class="big-number">
                    ${money(safeAmount)}
                </div>

                <p>
                    This is the amount that appears safer
                    based on your income, essential expenses,
                    existing EMIs and the safety adjustments
                    used by this prototype.
                </p>

                <div class="why-box">

                    <strong>
                        Why this amount?
                    </strong>

                    <p>
                        ${getAmountWhy(safeAmount)}
                    </p>

                </div>

            </div>

            <div class="result-card">

                <div class="card-label">
                    POTENTIAL LENDER CEILING
                </div>

                <div class="big-number">
                    ${money(lenderCeiling)}
                </div>

                <p>
                    An illustrative lender-style ceiling based
                    mainly on income and affordability.
                    This is NOT an approval.
                </p>

                <div class="warning-box">

                    <strong>
                        Which number should you use?
                    </strong>

                    <p>
                        Use your
                        <strong>borrower-safe amount</strong>
                        as the negotiation starting point,
                        not the maximum a lender may offer.
                    </p>

                </div>

            </div>

            <div class="result-card">

                <div class="card-label">
                    FAIR INTEREST RATE RANGE
                </div>

                <div class="big-number">

                    ${percent(rates.low)}
                    –
                    ${percent(rates.high)}

                </div>

                <p>
                    Estimated for a
                    ${productName()}
                    using the prototype rate band,
                    credit profile, repayment history and
                    income stability.
                </p>

            </div>

            <div class="result-card">

                <div class="card-label">
                    ESTIMATED ALL-IN APR
                </div>

                <div class="big-number">

                    ${
                        apr === null
                            ? "Unknown"
                            : percent(apr)
                    }

                </div>

                <p>
                    This estimate includes the stated interest
                    rate and the assumed
                    ${RULES.processingFee * 100}%
                    upfront processing fee.
                    Actual lender disclosure and charges may differ.
                </p>

            </div>

            <div class="result-card">

                <div class="card-label">
                    YOUR PROPOSED LOAN
                </div>

                <div class="stats-grid">

                    <div>
                        <span>Purpose</span>

                        <strong>
                            ${getPurposeName()}
                        </strong>
                    </div>

                    <div>
                        <span>Product</span>

                        <strong>
                            ${productName()}
                        </strong>
                    </div>

                    <div>
                        <span>Amount</span>

                        <strong>
                            ${money(state.amount)}
                        </strong>
                    </div>

                    <div>
                        <span>Tenure</span>

                        <strong>
                            ${state.tenure} years
                        </strong>
                    </div>

                    <div>
                        <span>Estimated EMI</span>

                        <strong>
                            ${money(proposedEmi)}
                        </strong>
                    </div>

                    <div>
                        <span>Total interest</span>

                        <strong>
                            ${money(totalInterest)}
                        </strong>
                    </div>

                    <div>
                        <span>Processing fee</span>

                        <strong>
                            ${money(
                                state.amount *
                                RULES.processingFee
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Credit score</span>

                        <strong>
                            ${
                                state.score === null
                                    ? "Unknown"
                                    : state.score
                            }
                        </strong>
                    </div>

                </div>

            </div>

            ${renderCollateralResult()}

            ${renderSavingsResult()}

            <div class="result-card">

                <div class="card-label">
                    RISK FACTORS
                </div>

                ${
                    risks.length === 0

                    ?

                    `

                    <div class="risk-good">

                        ✓ No major risk flags were identified
                        from the information provided.

                    </div>

                    `

                    :

                    `

                    <ul class="risk-list">

                        ${
                            risks
                                .map(
                                    risk =>
                                        `<li>${risk}</li>`
                                )
                                .join("")
                        }

                    </ul>

                    `

                }

                <p class="small-note">

                    These are assessment flags, not lender
                    approval rules. Actual underwriting may
                    consider additional information.

                </p>

            </div>

            <div class="result-card ${stress.className}">

                <div class="card-label">
                    20% INCOME DROP STRESS TEST
                </div>

                <h2>
                    ${stress.title}
                </h2>

                <p>
                    ${stress.text}
                </p>

            </div>

            ${renderNegotiationCard(
                rates,
                apr,
                proposedEmi
            )}

            <button
                class="primary-btn download-btn"
                onclick="downloadNegotiationCard()"
            >
                ↓ &nbsp; Download Negotiation Card
            </button>

            <button
                class="secondary-btn"
                onclick="restartAssessment()"
            >
                Start Again
            </button>

        </div>

    `;

}

function downloadNegotiationCard() {

    if (
        typeof window.jspdf === "undefined"
    ) {

        alert(
            "PDF library is still loading. Please try again."
        );

        return;

    }

    const {
        jsPDF
    } = window.jspdf;

    const doc =
        new jsPDF();

    const safeAmount =
        calculateSafeAmount();

    const rates =
        getRateBand();

    const midpointRate =
        (
            rates.low +
            rates.high
        ) / 2;

    const emi =
        calculateEmi(
            state.amount,
            midpointRate,
            state.tenure
        );

    const apr =
        calculateAPR(
            state.amount,
            midpointRate,
            state.tenure,
            RULES.processingFee
        );

    let y = 20;

    doc.setFontSize(20);

    doc.text(
        "LOKTA AI",
        20,
        y
    );

    y += 10;

    doc.setFontSize(16);

    doc.text(
        "BORROWER NEGOTIATION CARD",
        20,
        y
    );

    y += 14;

    doc.setFontSize(11);

    const details = [

        "Purpose: " +
        getPurposeName(),

        "Product: " +
        productName(),

        "Amount considering: " +
        money(state.amount),

        "Borrower-safe amount: " +
        money(safeAmount),

        "Fair rate range: " +
        rates.low +
        "% - " +
        rates.high +
        "%",

        "Estimated all-in APR: " +
        apr.toFixed(1) +
        "%",

        "Estimated EMI: " +
        money(emi),

        "Tenure: " +
        state.tenure +
        " years",

        "Processing fee assumption: " +
        RULES.processingFee * 100 +
        "%"

    ];

    details.forEach(line => {

        doc.text(
            line,
            20,
            y
        );

        y += 8;

    });

    y += 10;

    doc.setFontSize(14);

    doc.text(
        "BEFORE SIGNING, ASK:",
        20,
        y
    );

    y += 10;

    doc.setFontSize(11);

    const questions = [

        "1. Show me the all-in APR.",

        "2. Confirm the processing fee.",

        "3. Show me the total repayment amount.",

        "4. Confirm prepayment / foreclosure charges.",

        "5. Confirm the final EMI.",

        "6. Show all other mandatory charges."

    ];

    questions.forEach(question => {

        doc.text(
            question,
            20,
            y
        );

        y += 8;

    });

    y += 10;

    doc.setFontSize(9);

    doc.text(
        "Prototype estimate. Actual lender terms,",
        20,
        y
    );

    y += 5;

    doc.text(
        "fees, valuation and approval may differ.",
        20,
        y
    );

    doc.save(
        "Lokta-AI-Borrower-Negotiation-Card.pdf"
    );

}

function insertAfterCurrent(step) {

    const existingIndex =
        steps.findIndex(
            item => item.id === step.id
        );

    if (existingIndex !== -1) {

        return;

    }

    steps.splice(
        state.step + 1,
        0,
        step
    );

}

function next() {

    state.step++;

    if (
        state.step >= steps.length
    ) {

        state.step =
            steps.length - 1;

    }

    updateProgress();

    steps[
        state.step
    ].render();

}

function updateProgress() {

    const total =
        steps.length - 1;

    const percentage =
        Math.round(
            state.step /
            total *
            100
        );

    if (progress) {

        progress.style.width =
            percentage + "%";

    }

    if (progressText) {

        progressText.textContent =
            percentage + "%";

    }

    if (stepText) {

        if (
            steps[state.step].id === "result"
        ) {

            stepText.textContent =
                "Assessment complete";

        }

        else {

            stepText.textContent =
                "Question " +
                Math.min(
                    state.step + 1,
                    total
                );

        }

    }

}

function restartAssessment() {

    location.reload();

}

buildSteps();

updateProgress();

steps[0].render();