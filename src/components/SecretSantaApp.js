import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { generateAssignments, validateInputs } from '../utils/secretSantaUtils';
import toast from 'react-hot-toast';

const SecretSantaApp = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [previousYearData, setPreviousYearData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [errors, setErrors] = useState([]);

  const employeeFileRef = useRef(null);
  const previousYearFileRef = useRef(null);

  const parseFile = (file, fileType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Remove empty rows and process headers
          const filteredData = jsonData.filter((row) => row.length > 0);
          if (filteredData.length < 2) {
            toast.error("File must contain headers and at least one data row");
            return;
          }

          const requiredEmployeeFields = ["Employee_Name", "Employee_EmailID"];
          const requiredPreviousYearFields = ["Employee_Name", "Employee_EmailID", "Secret_Child_Name", "Secret_Child_EmailID"];

          // Extract headers
          const headers = filteredData[0].map((header) => header.trim());

          // Find missing fields for employee data
          const missingEmployeeFields = requiredEmployeeFields.filter(
            (field) => !headers.includes(field)
          );

          // Find missing fields for previous year data
          const missingPreviousYearFields = requiredPreviousYearFields.filter(
            (field) => !headers.includes(field)
          );

          if (missingEmployeeFields?.length === 0 && fileType === "Employee" && headers?.length > 2) {
            employeeFileRef.current.value = "";
            toast.error(`Headers mismatch! fields should be only: Employee_Name, Employee_EmailID`);
            return;
          }

          // Check for mismatches and show errors
          if (missingEmployeeFields.length > 0 && fileType === "Employee") {
            employeeFileRef.current.value = "";
            toast.error(
              `Headers mismatch! Missing fields: ${[
                ...missingEmployeeFields,
              ].join(", ")}`
            );
            return;
          }

          if (missingPreviousYearFields.length > 0 && fileType === "Previous Year") {
            previousYearFileRef.current.value = "";
            toast.error(
              `Headers mismatch! Missing fields: ${[
                ...missingPreviousYearFields,
              ].join(", ")}`
            );
            return;
          }

          // Convert array format to object format with proper headers
          const rows = filteredData.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });

          resolve(rows);
        } catch (error) {
          reject(new Error(`Failed to parse file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e, setData, fileType) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }

      const parsedData = await parseFile(file, fileType);

      setData(parsedData);
      setErrors([]); // Clear errors on successful upload
    } catch (error) {
      setErrors(prev => [...prev, `${fileType} File Error: ${error.message}`]);
    }
  };

  const generateSecretSanta = () => {
    try {
      const validationErrors = validateInputs(employeeData, previousYearData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      const secretSantaAssignments = generateAssignments(employeeData, previousYearData);

      setAssignments(secretSantaAssignments);
      setErrors([]);
    } catch (error) {
      setErrors([...errors, `Assignment Error: ${error.message}`]);
    }
  };

  const downloadAssignments = () => {
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(assignments);
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assignments');
    
    // Generate and download file
    XLSX.writeFile(wb, 'secret_santa_assignments.xlsx');
  };

  const handleDownloadPreviousYearSampleFile = () => {
    const sampleFileUrl = '/assets/csv/Previous-Year-List.xlsx';
    const a = document.createElement('a');
    a.href = sampleFileUrl;
    a.download = 'Previous-Year-List.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadEmployeeSampleFile = () => {
    const sampleFileUrl = '/assets/csv/Employee-List.xlsx';
    const a = document.createElement('a');
    a.href = sampleFileUrl;
    a.download = 'Employee-List.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        Secret Santa Assignment Generator
      </h1>

      {errors.length > 0 && (
        <div className="alert alert-danger mb-4">
          {errors.map((error, index) => (
            <div key={index} className='mb-2'>{error}</div>
          ))}
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title">
                  Employee List
                </h4>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleDownloadEmployeeSampleFile}
                >
                  <i className="bi bi-download me-2"></i>
                  Download Sample Template
                </button>
              </div>
              <div className="mb-3">
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls"
                  ref={employeeFileRef}
                  onChange={(e) => handleFileUpload(e, setEmployeeData, 'Employee')}
                  className="form-control"
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn btn-outline-primary w-100"
                  onClick={() => employeeFileRef.current.click()}
                >
                  <i className="bi bi-upload me-2"></i>
                  Upload Employees
                </button>
                {employeeData.length > 0 && (
                  <div className="d-flex justify-content-center align-items-center mt-2">
                    <small className="text-success me-3">
                      ✓ {employeeData.length} employees loaded
                    </small>
                    <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={()=> {
                          setEmployeeData([])
                          employeeFileRef.current.value = "";
                          setErrors([]);
                        }}
                      >
                        Remove
                      </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title">Previous Year Assignments</h4>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleDownloadPreviousYearSampleFile}
                >
                  <i className="bi bi-download me-2"></i>
                  Download Sample Template
                </button>
              </div>
              <div className="mb-3">
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls"
                  ref={previousYearFileRef}
                  onChange={(e) => handleFileUpload(e, setPreviousYearData, 'Previous Year')}
                  className="form-control"
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn btn-outline-primary w-100"
                  onClick={() => previousYearFileRef.current.click()}
                >
                  <i className="bi bi-upload me-2"></i>
                  Upload Previous Year
                </button>
                {previousYearData.length > 0 && (
                  <div className="d-flex justify-content-center align-items-center mt-2">
                    <small className="text-success me-3">
                      ✓ {previousYearData.length} previous assignments loaded
                    </small>
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm"
                      onClick={()=> {
                        setPreviousYearData([])
                        previousYearFileRef.current.value = "";
                        setErrors([]);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <button 
          className="btn btn-primary btn-lg"
          onClick={generateSecretSanta}
          disabled={employeeData.length === 0 || previousYearData?.length === 0 || assignments?.length > 0}
        >
          Generate Secret Santa Assignments
        </button>
      </div>

      {assignments.length > 0 && (
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
              <button 
                className="btn btn-success"
                onClick={()=> setAssignments([])}
              >
                <i className="bi bi-download me-2"></i>
                Clear Assignments
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
                  {assignments.map((assignment, index) => (
                    <tr key={index}>
                      <td>{assignment.Employee_Name}</td>
                      <td>{assignment.Employee_EmailID}</td>
                      <td>{assignment.Secret_Child_Name}</td>
                      <td>{assignment.Secret_Child_EmailID}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretSantaApp;