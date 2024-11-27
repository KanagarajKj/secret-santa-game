import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { importEmployees, generateAssignments } from '../actions/employeeActions';
import AssignmentData from './AssignmentData';

const EmployeeImport = () => {
  const [currentYearFile, setCurrentYearFile] = useState(null);
  const [previousYearFile, setPreviousYearFile] = useState(null);
  const [assignmentData, setAssignmentData] = useState([]);
  const [currentEmployeeInsertCount, setCurrentEmployeeInsertCount] = useState('');
  const [previousEmployeeInsertCount, setPreviousEmployeeInsertCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (fileType, e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please select CSV or XLSX.');
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }

      if (fileType === 'current') {
        setCurrentYearFile(selectedFile);
      } else {
        setPreviousYearFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = (fileType) => {
    if (fileType === 'current') {
      setCurrentYearFile(null);
      const fileInput = document.getElementById('currentYearFileInput');
      if (fileInput) fileInput.value = '';
    } else {
      setPreviousYearFile(null);
      const fileInput = document.getElementById('previousYearFileInput');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleImport = async () => {
    // Validate both files are selected
    if (!currentYearFile || !previousYearFile) {
      toast.error('Please select both current and previous year files');
      return;
    }

    setIsLoading(true);
    setAssignmentData([]);
    try {
      // You might want to modify importEmployees to handle multiple files
      const currentYearResponse = await importEmployees(currentYearFile, 'current');
      const previousYearResponse = await importEmployees(previousYearFile, 'previous');

      if(currentYearResponse?.status === 201 && previousYearResponse?.status === 201) {
          toast.success('Both files imported successfully');

          setCurrentEmployeeInsertCount(currentYearResponse?.data?.message);
          setPreviousEmployeeInsertCount(previousYearResponse?.data?.message);

        const assignmentData = await generateAssignments();
        if(assignmentData?.data?.assignmentsData?.length > 0) {
          setAssignmentData(assignmentData?.data?.assignmentsData)
        } else {
          toast.error("Data not generated")
          setAssignmentData([]);
        }
      }

    } catch (err) {
      toast.error(err.message || 'An error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0 text-center">Santa Game</h4>
            </div>
            <div className="card-body">
              {/* Current Year Import */}
              <div className="mb-4">
                <h5 className="mb-3">Current Year Employee Import</h5>
                <div className="row align-items-center">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="currentYearFileInput" className="form-label">
                        Select Current Year CSV or XLSX File
                      </label>
                      <div className="input-group">
                        <input 
                          id="currentYearFileInput"
                          type="file" 
                          className="form-control" 
                          accept=".csv, .xlsx"
                          onChange={(e) => handleFileChange('current', e)}
                        />
                        {currentYearFile && (
                          <button 
                            className="btn btn-outline-danger" 
                            type="button"
                            onClick={() => handleRemoveFile('current')}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      {currentYearFile && (
                        <small className="text-muted">
                          Selected file: {currentYearFile.name}
                        </small>
                      )}
                      {currentEmployeeInsertCount?.length > 0 && (
                        <small className="px-3 text-success">
                          {currentEmployeeInsertCount}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Year Import */}
              <div className="mb-4">
                <h5 className="mb-3">Previous Year Employee Import</h5>
                <div className="row align-items-center">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="previousYearFileInput" className="form-label">
                        Select Previous Year CSV or XLSX File
                      </label>
                      <div className="input-group">
                        <input 
                          id="previousYearFileInput"
                          type="file" 
                          className="form-control" 
                          accept=".csv, .xlsx"
                          onChange={(e) => handleFileChange('previous', e)}
                        />
                        {previousYearFile && (
                          <button 
                            className="btn btn-outline-danger" 
                            type="button"
                            onClick={() => handleRemoveFile('previous')}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      {previousYearFile && (
                        <small className="text-muted">
                          Selected file: {previousYearFile.name}
                        </small>
                      )}
                      {previousEmployeeInsertCount?.length > 0 && (
                        <small className="px-3 text-success">
                          {previousEmployeeInsertCount}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Import Button */}
              <button 
                className="btn btn-primary w-100"
                onClick={handleImport}
                disabled={isLoading || !currentYearFile || !previousYearFile}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {
      assignmentData?.length > 0 && (
        <>
          <AssignmentData assignmentData={assignmentData}/>
        </>
      )
    }
    </>
  );
};

export default EmployeeImport;