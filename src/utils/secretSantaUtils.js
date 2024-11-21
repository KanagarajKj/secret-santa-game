export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim();
          return obj;
        }, {});
      });
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const validateInputs = (employeeData, previousYearData) => {
  const errors = [];

  // Check if employee data is provided
  if (!employeeData || employeeData.length === 0) {
    errors.push("Employee data is required");
  }

  // Check if previous year data is provided
  if (!previousYearData || previousYearData.length === 0) {
    errors.push("Previous Year Employee data is required");
  }

  const requiredEmployeeFields = ["Employee_Name", "Employee_EmailID"];
  const requiredPreviousYearFields = ["Employee_Name", "Employee_EmailID", "Secret_Child_Name", "Secret_Child_EmailID"];

  // Check for empty fields in employee data
  if (employeeData && employeeData.length > 0) {
    const emailSet = new Set();

    employeeData.forEach((employee, index) => {
      requiredEmployeeFields.forEach((field) => {
        if (!employee[field] || employee[field].trim() === "") {
          errors.push(`Missing or empty ${field} in employee data at row ${index + 1}`);
        }
      });

      // Check for duplicate emails
      if (emailSet.has(employee.Employee_EmailID)) {
        errors.push(
          `Duplicate Employee_EmailID "${employee.Employee_EmailID}" in employee data at row ${index + 1}`
        );
      } else {
        emailSet.add(employee.Employee_EmailID);
      }
    });
  }

  // Check for empty fields in previous year data
  if (previousYearData && previousYearData.length > 0) {
    previousYearData.forEach((record, index) => {
      requiredPreviousYearFields.forEach((field) => {
        if (!record[field] || record[field].trim() === "") {
          errors.push(`Missing or empty ${field} in previous year data at row ${index + 1}`);
        }
      });
    });
  }

  return errors;
};

export const generateAssignments = (employeeData, previousYearData) => {
  // Create a pool of available employees for assignment
  const availableEmployees = [...employeeData];
  const assignments = [];

  // Iterate through each employee to assign a secret child
  for (const currentEmployee of employeeData) {
    // Find previous year's assignment for current employee
    const previousYearAssignment = previousYearData?.find(
      prev => prev.Employee_EmailID === currentEmployee.Employee_EmailID
    );

    // Filter potential secret children
    const potentialSecretChildren = availableEmployees.filter(employee => {
      const constraints = [
        // Cannot choose themselves
        employee.Employee_EmailID !== currentEmployee.Employee_EmailID,
        
        // Cannot choose previous year's secret child
        employee.Employee_EmailID !== previousYearAssignment?.Secret_Child_EmailID,
        
        // Cannot be already assigned
        !assignments.some(
          assignment => assignment.Secret_Child_EmailID === employee.Employee_EmailID
        )
      ];

      return constraints.every(Boolean);
    });

    // If no valid secret child found, throw an error
    if (potentialSecretChildren.length === 0) {
      throw new Error(`No valid secret child found for ${currentEmployee.Employee_Name}`);
    }

    // Randomly select a secret child
    const secretChildIndex = Math.floor(Math.random() * potentialSecretChildren.length);
    const selectedSecretChild = potentialSecretChildren[secretChildIndex];

    // Create assignment
    const assignment = {
      Employee_Name: currentEmployee.Employee_Name,
      Employee_EmailID: currentEmployee.Employee_EmailID,
      Secret_Child_Name: selectedSecretChild.Employee_Name,
      Secret_Child_EmailID: selectedSecretChild.Employee_EmailID
    };

    // Add to assignments
    assignments.push(assignment);

    // Remove selected secret child from available pool
    const indexToRemove = availableEmployees.findIndex(
      emp => emp.Employee_EmailID === selectedSecretChild.Employee_EmailID
    );
    availableEmployees.splice(indexToRemove, 1);
  }

  // Final validation
  // Ensure all employees are assigned
  if (assignments.length !== employeeData.length) {
    throw new Error("Failed to generate complete Secret Santa assignments");
  }

  // Ensure no duplicate secret children
  const uniqueSecretChildren = new Set(
    assignments.map(assignment => assignment.Secret_Child_EmailID)
  );
  if (uniqueSecretChildren.size !== assignments.length) {
    throw new Error("Duplicate secret child assignments detected");
  }

  return assignments;
};