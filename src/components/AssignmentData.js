import React from 'react';
import * as XLSX from 'xlsx'; // Ensure you import XLSX for generating files

const AssignmentData = React.memo(({ assignmentData }) => {
    
    const downloadAssignments = () => {
        // Check if there are any assignmentData
        if (!assignmentData || assignmentData.length === 0) {
        alert('No assignmentData to download!');
        return;
        }
        // Create worksheet from the assignmentData data
        const ws = XLSX.utils.json_to_sheet(assignmentData);

        // Create workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Assignments');

        // Generate and download file
        XLSX.writeFile(wb, 'secret_santa_assignments-2024.xlsx');
    };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Generated Assignments</h5>
          <div>
            <button
              className="btn btn-success me-2"
              onClick={downloadAssignments}
            >
              <i className="bi bi-download me-2"></i>
              Download Assignments
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-light">
              <tr>
                <th>Employee Name</th>
                <th>Employee Email</th>
                <th>Secret Child Name</th>
                <th>Secret Child Email</th>
              </tr>
            </thead>
            <tbody>
              {assignmentData && assignmentData.length > 0 ? (
                assignmentData.map((assignment, index) => (
                  <tr key={index}>
                    <td>{assignment.Employee_Name}</td>
                    <td>{assignment.Employee_EmailID}</td>
                    <td>{assignment.Secret_Child_Name}</td>
                    <td>{assignment.Secret_Child_EmailID}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No assignment data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default AssignmentData;
