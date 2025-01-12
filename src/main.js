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
        }
    </style>
    <div id="table-container">
        <table id="my-table">
            <thead>
                <tr>
                    <th>Targets</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>#HCPs</td>
                </tr>
            </tbody>
        </table>
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

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#productMetrics = this.productMetrics;
        this.#accounts = this.accounts;
    }

    connectedCallback() {
        this.shadowRoot.appendChild(templateDoubleTable.content.cloneNode(true));
        this.#renderChart();
        this.#renderHcpTable();
    }

    set productMetrics(newProductMetrics) {
        this.#productMetrics = newProductMetrics;
        this.#updateChart();
    }

    set accounts(newAccounts) {
        this.#accounts = newAccounts;
        this.#updateChart();
    }

    #renderChart() {
        const table = this.shadowRoot.getElementById('my-table');

        // Define tiers and their labels
        const tiers = [
            { label: 'T1', filter: metric => metric.tier === 'Tier 1', type: 'Tier 1' },
            { label: 'T2', filter: metric => metric.tier === 'Tier 2', type: 'Tier 2' },
            { label: 'T3', filter: metric => metric.tier === 'Tier 3', type: 'Tier 3' },
            { label: 'Others', filter: metric => !['Tier 1', 'Tier 2', 'Tier 3'].includes(metric.tier), type: 'Others' }
        ];
        
        const headerRow = table.tHead.rows[0];
        const rows = table.tBodies[0].rows;

        tiers.forEach(tier => {
            // Filter data for the current tier
            const tierData = this.#productMetrics.filter(tier.filter);

            // Add a new header cell
            const newHeader = document.createElement('th');
            newHeader.textContent = tier.label;
            headerRow.appendChild(newHeader);

            // Add a new cell for each row
            for (let i = 0; i < rows.length; i++) {
                const newCell = document.createElement('td');
                const button = document.createElement('a');
                button.textContent = `${tierData.length}`;
                button.addEventListener('click', () => {
                    this.#currentType = tier.type;
                    this.#renderHcpTable();
                });
                newCell.appendChild(button);
                rows[i].appendChild(newCell);
            }
        });
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
    
        // Create the new HCP table
        const hcpTable = document.createElement('table');
        hcpTable.id = 'hcp-table';
    
        // Add table headers
        const headerRow = document.createElement('tr');
        ['Id', 'Name'].forEach(headerText => {
            const headerCell = document.createElement('th');
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });
        hcpTable.appendChild(headerRow);
    
        // Add table rows
        filteredAccounts.forEach(account => {
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            idCell.textContent = account.id;
            const nameCell = document.createElement('td');
            nameCell.textContent = account.name;
            row.appendChild(idCell);
            row.appendChild(nameCell);
            hcpTable.appendChild(row);
        });
    
        // Append the new table to the container
        hcpTableContainer.appendChild(hcpTable);
    }
    

    #updateChart() {
    }
}

// Define the custom element
customElements.define('double-table', DoubleTables);