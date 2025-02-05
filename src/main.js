// Template for the custom element
const templateDoubleTable = document.createElement('template');
templateDoubleTable.innerHTML = `
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        td a {
            color: #007bff;
            cursor: pointer;
        }
        p {
            margin: 0;
            padding: 0;
        }
    </style>
    <div id="wrapper-container">
        <div id="table-container"></div>
        <div id="hcp-table-container"></div>
    </div>
`;

/**
 * @prop {Array<number>} productMetrics
 * @prop {Array<number>} accounts
 */
class DoubleTables extends HTMLElement {
    #productMetrics = [];
    #accounts = [];
    #currentType = null;
    #reachTier1 = 0;
    #reachTier2 = 0;
    #reachTier3 = 0;
    #reachOthers = 0;
    #cpaTier1 = 0;
    #cpaTier2 = 0;
    #cpaTier3 = 0;
    #cpaOthers = 0;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set productMetrics(newProductMetrics) { this.#productMetrics = newProductMetrics; }
    set accounts(newAccounts) { this.#accounts = newAccounts; }

    set reachTier1(value) { this.#reachTier1 = value; }
    set reachTier2(value) { this.#reachTier2 = value; }
    set reachTier3(value) { this.#reachTier3 = value; }
    set reachOthers(value) { this.#reachOthers = value; }
    set cpaTier1(value) { this.#cpaTier1 = value; }
    set cpaTier2(value) { this.#cpaTier2 = value; }
    set cpaTier3(value) { this.#cpaTier3 = value; }
    set cpaOthers(value) { this.#cpaOthers = value; }

    get reachTier1() { return this.#reachTier1; }
    get reachTier2() { return this.#reachTier2; }
    get reachTier3() { return this.#reachTier3; }
    get reachOthers() { return this.#reachOthers; }
    get cpaTier1() { return this.#cpaTier1; }
    get cpaTier2() { return this.#cpaTier2; }
    get cpaTier3() { return this.#cpaTier3; }
    get cpaOthers() { return this.#cpaOthers; }

    connectedCallback() {
        this.shadowRoot.appendChild(templateDoubleTable.content.cloneNode(true));
        this.#renderChart();
        this.#renderHcpTable();
    }

    #renderChart() {
        const tableContainer = this.shadowRoot.getElementById('table-container');
        tableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.id = 'my-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Targets', 'T1', 'T2', 'T3', 'Others'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Others'];

        const hcpCounts = tiers.map(tier =>
            this.#productMetrics.filter(metric => metric.tier === tier || (tier === 'Others' && !['Tier 1', 'Tier 2', 'Tier 3'].includes(metric.tier))).length
        );

        const rows = [
            { label: '#HCPs', values: hcpCounts },
            { label: 'Reach', values: [this.#reachTier1, this.#reachTier2, this.#reachTier3, this.#reachOthers] },
            { label: 'CPA', values: [this.#cpaTier1, this.#cpaTier2, this.#cpaTier3, this.#cpaOthers] }
        ];

        rows.forEach(rowData => {
            const row = document.createElement('tr');
            const labelCell = document.createElement('td');
            labelCell.textContent = rowData.label;
            row.appendChild(labelCell);

            rowData.values.forEach((value, index) => {
                const cell = document.createElement('td');
                if (rowData.label === '#HCPs') {
                    const button = document.createElement('a');
                    button.textContent = value;
                    button.addEventListener('click', () => {
                        this.#currentType = this.#currentType !== tiers[index] ? tiers[index] : null;
                        this.#renderHcpTable();
                    });
                    cell.appendChild(button);
                } else {
                    const text = document.createElement('p');
                    text.textContent = `${value}%`;
                    cell.appendChild(text);
                }
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    #renderHcpTable() {
        const hcpTableContainer = this.shadowRoot.getElementById('hcp-table-container');

        // Clear existing table if any
        hcpTableContainer.innerHTML = '';

        // Hide the table if currentType is null
        if (this.#currentType === null) {
            return;
        }

        // Filter data based on currentType
        const filteredMetrics = this.#productMetrics.filter(metric => {
            if (this.#currentType === 'Others') {
                return !['Tier 1', 'Tier 2', 'Tier 3'].includes(metric.tier);
            }
            return metric.tier === this.#currentType;
        });

        const filteredAccounts = this.#accounts.filter(account =>
            filteredMetrics.some(metric => metric.account === account.id)
        );

        //create title
        const tableTitle = document.createElement('div');
        tableTitle.textContent = "HCPs";
        tableTitle.style.marginBottom = '6px';
        tableTitle.style.fontWeight = 'bold';
        hcpTableContainer.appendChild(tableTitle);

        const tableWrapper = document.createElement('div');
        tableWrapper.id = 'hcp-table-wrapper';
        tableWrapper.style.height = '550px';
        tableWrapper.style.overflowY = 'auto';
        tableWrapper.style.position = 'relative';
        
        hcpTableContainer.appendChild(tableWrapper);

        // Create the new HCP table
        const hcpTable = document.createElement('table');
        hcpTable.id = 'hcp-table';

        // Add table headers
        const headerRow = document.createElement('tr');
        ['Id', 'HCP Full Name', 'Master Account Name', 'Tiering', 'Epidyolex Adoption Ladder', 'Holistic Mgt of Epi Patients', 'On Medical Plan', '# Calls', '# Emails Open'].forEach(headerText => {
            const headerCell = document.createElement('th');
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });
        headerRow.style.position = 'sticky';
        headerRow.style.top = '0px';
        headerRow.style.zIndex = '99';
        hcpTable.appendChild(headerRow);

        // Add table rows
        filteredAccounts.forEach(({ id, name, masterAccountName, tiering, epidyolexAdoptionLadder, holisticMgtOfEpiPatients, onMedicalPlan, calls, emailsOpen }) => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = id;
            row.appendChild(idCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = name;
            row.appendChild(nameCell);

            const masterAccountNameCell = document.createElement('td');
            masterAccountNameCell.textContent = masterAccountName;
            row.appendChild(masterAccountNameCell);

            const tieringCell = document.createElement('td');
            tieringCell.textContent = tiering;
            row.appendChild(tieringCell);

            const epidyolexAdoptionLadderCell = document.createElement('td');
            epidyolexAdoptionLadderCell.textContent = epidyolexAdoptionLadder;
            row.appendChild(epidyolexAdoptionLadderCell);

            const holisticMgtOfEpiPatientsCell = document.createElement('td');
            holisticMgtOfEpiPatientsCell.textContent = holisticMgtOfEpiPatients;
            row.appendChild(holisticMgtOfEpiPatientsCell);

            const onMedicalPlanCell = document.createElement('td');
            onMedicalPlanCell.textContent = onMedicalPlan;
            row.appendChild(onMedicalPlanCell);

            const callsCell = document.createElement('td');
            callsCell.textContent = calls;
            row.appendChild(callsCell);

            const emailsOpenCell = document.createElement('td');
            emailsOpenCell.textContent = emailsOpen;
            row.appendChild(emailsOpenCell);

            hcpTable.appendChild(row);
        });

        // Append the new table to the container
        tableWrapper.appendChild(hcpTable);
    }
}

// Define the custom element
customElements.define('double-table', DoubleTables);