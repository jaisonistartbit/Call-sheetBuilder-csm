import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useMemo } from 'react';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const AGGridTable = () => {
  const columnDefs = [
    {
    headerName: "",
    field: "drag",
    rowDrag: true,  // enables row dragging
    width: 50,
  },
    {
      field: 'role',
      headerName: 'Role',
      sortable: true,
      filter: true,
      width: 150,
      cellStyle: () => {
        // Make role cells bold and with background color
        return {
          fontWeight: 'bold' 
        };
      }
    },
    { field: 'id', headerName: 'ID', sortable: true, filter: true, width: 80 },
    { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 1 },
    { field: 'email', headerName: 'Email', sortable: true, filter: true, flex: 1 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120 }
  ];

  // Sort data by role to group them together
  const rowData = useMemo(() => {
    const data = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer', status: 'Active' },
      { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Developer', status: 'Active' },
      { id: 6, name: 'David Lee', email: 'david@example.com', role: 'Developer', status: 'Active' },
      { id: 10, name: 'Henry Taylor', email: 'henry@example.com', role: 'Developer', status: 'Active' },
      { id: 12, name: 'Jack Anderson', email: 'jack@example.com', role: 'Developer', status: 'Active' },
      

      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', status: 'Active' },
      { id: 7, name: 'Emma Wilson', email: 'emma@example.com', role: 'Designer', status: 'Active' },
      { id: 11, name: 'Iris Martinez', email: 'iris@example.com', role: 'Designer', status: 'Active' },

      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Inactive' },
      { id: 8, name: 'Frank Miller', email: 'frank@example.com', role: 'Manager', status: 'Active' },
      { id: 14, name: 'Liam Harris', email: 'liam@example.com', role: 'Manager', status: 'Active' },

      { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Analyst', status: 'Active' },
      { id: 9, name: 'Grace Chen', email: 'grace@example.com', role: 'Analyst', status: 'Inactive' },
      { id: 13, name: 'Kate White', email: 'kate@example.com', role: 'Analyst', status: 'Active' }
    ];
    return data;
  }, []);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  // Custom row style to add visual separation between role groups
  const getRowStyle = (params) => {
    const currentRole = params.data.role;
    const previousRow = params.node.rowIndex > 0 ? params.api.getDisplayedRowAtIndex(params.node.rowIndex - 1) : null;
    const previousRole = previousRow ? previousRow.data.role : null;

    // If this is the first row of a new role group, add top border
    if (currentRole !== previousRole) {
      return {
        borderTop: '3px solid #2563eb',
        fontWeight: params.node.rowIndex === 0 ? 'normal' : 'normal'
      };
    }
    return null;
  };
const gridOptions = {
    rowDragManaged: true,
    animateRows: true,
  };
  return (
    <div className="ag-theme-alpine w-full h-full" style={{ minHeight: '400px' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        animateRows={true}
        suppressMovableColumns={false}
        getRowStyle={getRowStyle}
        domLayout='normal'
        gridOptions={gridOptions}
      />
    </div>
  );
};

export default AGGridTable;
