const express = require('express');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');
const http = require("http"); // Ensure http is imported
const multer = require('multer');
const { Server } = require("socket.io");
const cron = require('node-cron');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');

dotenv.config();


const app = express();

// Allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173' , 'https://malagos-health-center.netlify.app'];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

// Set up HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // Database host
  user: process.env.DB_USER,       // Database user
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME    // Database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  return res.json("Node server is running...");
});

const safeParseJSON = (str) => {
  try {
    let parsed = str;
    // Attempt to parse multiple times if the string is double-escaped
    while (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return parsed;
  } catch (e) {
    return {};
  }
};

// Function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  
};
//==========================PRINT 10-19 YEARS OLD=====================================//

app.get('/print/children10to19', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.phone_no,
      c.phil_id,
      c.gender, 
      c.birthdate, 
      c.age,
      zf.pwd_number,
      zf.nhts_pr_id,
      zf.cct_id_number,
      zf.phic_id_number,
      zf.indigenous_people,
      zf.ethnic_group,
      zf.height,
      zf.weight,
      zf.bmi,
      zf.educational_status,
      zf.age_details,
      zf.immunization_services,
      zf.additional_comments
    FROM 
      client_tbl c
    INNER JOIN 
      ten_to_nineteen zf
    ON 
      c.id = zf.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = '10-19 Years Old (Adolescents)'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Children10to19_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(24).text('10-19 Years Old (Adolescents) Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    const allColumns = [
      '#',
      'Full Name',
      'Address',
      'Phone No.',
      'Phil ID',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'Educational Status',
      'Age Details',
      'Immunization Services',
      'Additional Comments',
    ];

    // Define column widths in points
    const columnWidths = {
      '#': 25,
      'Full Name': 100,
      'Address': 100,
      'Phone No.': 80,
      'Phil ID': 80,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 80,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 80,
      'Ethnic Group': 80,
      'Height (cm)': 60,
      'Weight (kg)': 60,
      'BMI': 40,
      'Educational Status': 100,
      'Age Details': 150,
      'Immunization Services': 150,
      'Additional Comments': 80,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const fontSize = 8;

    /**
     * Function to draw table header with borders and background
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      // Set header background
      const totalTableWidth = columns.reduce((sum, col) => sum + columnWidths[col], 0);
      doc.rect(startX, currentY, totalTableWidth, 20).fillAndStroke('#f0f0f0', '#000000'); // Light gray background with black border

      columns.forEach(col => {
        doc.fillColor('#000000') // Set text color to black
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += 20; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping with alternating row colors
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell
        let maxHeight = 20; // Minimum row height (same as header)

        // Calculate the required height for each cell and determine the maximum height for the row
        const cellHeights = columns.map((col, idx) => {
          const text = rowData[idx];
          const textHeight = doc.heightOfString(text, { 
            width: columnWidths[col] - (cellPadding * 2), 
            align: 'left', 
            lineBreak: true,
          });
          return Math.ceil(textHeight) + (cellPadding * 2);
        });

        maxHeight = Math.max(...cellHeights, 20); // Ensure a minimum height

        // Set alternating row background color
        if (index % 2 === 0) {
          doc.rect(startX, currentY, columns.reduce((sum, col) => sum + columnWidths[col], 0), maxHeight)
            .fill('#f9f9f9') // Light shade for even rows
            .stroke('#000000'); // Black border
        } else {
          doc.rect(startX, currentY, columns.reduce((sum, col) => sum + columnWidths[col], 0), maxHeight)
            .fill('#ffffff') // White background for odd rows
            .stroke('#000000'); // Black border
        }

        // Draw cells with dynamic height and add text
        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = maxHeight;

          // Add text with wrapping
          doc.fillColor('#000000') // Ensure text color is black
            .text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
              width: cellWidth - (cellPadding * 2),
              align: 'left',
              lineBreak: true,
            });

          currentX += cellWidth;
        });

        currentY += maxHeight; // Move Y position for the next row

        // Check if the row exceeds the page height
        if (currentY + maxHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add a note that content exceeds single page
          doc.font('Helvetica').fontSize(8).fillColor('red')
            .text('Content exceeds single page. Some data may not be displayed.', startX, currentY, {
              align: 'left',
            });
          // Stop adding more rows
          return;
        }
      });
    };

    /**
     * Prepare Data
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const ageDetails = safeParseJSON(row.age_details, []);
      const immunizationServices = safeParseJSON(row.immunization_services, {});

      // Format age details into a string
      const ageDetailsText = Array.isArray(ageDetails) && ageDetails.length > 0
        ? ageDetails.map(detail => `Age ${detail.age}: ${formatDate(detail.dateGiven1)} to ${formatDate(detail.dateGiven2)}`).join('\n')
        : 'N/A';

      // Format immunization services into a string
      const immunizationText = immunizationServices && Object.keys(immunizationServices).length > 0
        ? Object.entries(immunizationServices).map(([key, value]) => `${key}: ${formatDate(value)}`).join('\n')
        : 'N/A';

      return {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Phone No.': row.phone_no || 'N/A',
        'Phil ID': row.phil_id || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Height (cm)': row.height || 'N/A',
        'Weight (kg)': row.weight || 'N/A',
        'BMI': row.bmi || 'N/A',
        'Educational Status': row.educational_status || 'N/A',
        'Age Details': ageDetailsText,
        'Immunization Services': immunizationText,
        'Additional Comments': row.additional_comments || 'N/A',
      };
    });

    /**
     * Draw Table
     */
    drawTableHeader(allColumns, columnWidths);
    drawTableRows(allColumns, columnWidths, preparedData);

    /**
     * Add Page Number for the Last Page
     */
    doc.font('Helvetica').fontSize(8).fillColor('black')
      .text(`Page 1 of 1`, 0, doc.page.height - 50, {
        align: 'center',
      });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});

//=============================PRINT 5 TO 9 YEARS OLD CHILDREN ==============================//

app.get('/print/children5to9', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.phone_no,
      c.phil_id,
      c.gender, 
      c.birthdate, 
      c.age,
      zf.pwd_number,
      zf.nhts_pr_id,
      zf.cct_id_number,
      zf.phic_id_number,
      zf.indigenous_people,
      zf.ethnic_group,
      zf.height,
      zf.weight,
      zf.bmi,
      zf.educational_status
    FROM 
      client_tbl c
    INNER JOIN 
      five_nine_children zf
    ON 
      c.id = zf.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = '5-9 Years Old Children (School Aged Children)'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Children5to9_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(24).text('5-9 Years Old Children (School Aged Children) Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    const allColumns = [
      '#',
      'Full Name',
      'Address',
      'Phone No.',
      'Phil ID',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'Educational Status',
      'Remarks',
    ];

    // Define column widths in points
    const columnWidths = {
      '#': 25,
      'Full Name': 100,
      'Address': 150,
      'Phone No.': 80,
      'Phil ID': 80,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 80,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 80,
      'Ethnic Group': 80,
      'Height (cm)': 60,
      'Weight (kg)': 60,
      'BMI': 40,
      'Educational Status': 100,
      'Remarks': 100,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const fontSize = 8;

    /**
     * Function to draw table header with borders and background
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      // Set header background
      const totalTableWidth = columns.reduce((sum, col) => sum + columnWidths[col], 0);
      doc.rect(startX, currentY, totalTableWidth, 20).fillAndStroke('#f0f0f0', '#000000'); // Light gray background with black border

      columns.forEach(col => {
        doc.fillColor('#000000') // Set text color to black
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += 20; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell
        let maxHeight = 20; // Minimum row height (same as header)

        // Calculate the required height for each cell and determine the maximum height for the row
        const cellHeights = columns.map((col, idx) => {
          const text = rowData[idx];
          const textHeight = doc.heightOfString(text, { 
            width: columnWidths[col] - (cellPadding * 2), 
            align: 'left', 
            lineBreak: true,
          });
          return Math.ceil(textHeight) + (cellPadding * 2);
        });

        maxHeight = Math.max(...cellHeights, 20); // Ensure a minimum height

        // Check if the row exceeds the page height
        if (currentY + maxHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page ${doc.bufferedPageRange().count} of 1`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 50; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }

        // Draw cells with dynamic height
        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = maxHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Add text with wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += maxHeight; // Move Y position for the next row
      });
    };

    /**
     * Prepare Data
     */
    const preparedData = results.map((row, index) => {
      return {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Phone No.': row.phone_no || 'N/A',
        'Phil ID': row.phil_id || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Height (cm)': row.height || 'N/A',
        'Weight (kg)': row.weight || 'N/A',
        'BMI': row.bmi || 'N/A',
        'Educational Status': row.educational_status || 'N/A',
        'Remarks': row.remarks || 'N/A',
      };
    });

    /**
     * Draw Table
     */
    drawTableHeader(allColumns, columnWidths);
    drawTableRows(allColumns, columnWidths, preparedData);

    /**
     * Add Page Number for the Last Page
     */
    doc.font('Helvetica').fontSize(8).text(`Page 1 of 1`, 0, doc.page.height - 50, {
      align: 'center',
    });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});


//==================PRINT 0-59 SCREENED VISUAL ACTIVITY ================================//

app.get('/print/screened059', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.phone_no,
      c.phil_id,
      c.gender, 
      c.birthdate, 
      c.age,
      zf.pwd_number,
      zf.nhts_pr_id,
      zf.cct_id_number,
      zf.phic_id_number,
      zf.indigenous_people,
      zf.ethnic_group,
      zf.marital_status,
      zf.suspected_cases,
      zf.suspected_cases_referred,
      zf.visit_dates,
      zf.vision_test,
      zf.referral_options,
      zf.remarks
    FROM 
      client_tbl c
    INNER JOIN 
      zero_to_fiftynine zf
    ON 
      c.id = zf.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = '0-59 Years Old Screened For Visual Activity'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Screened059_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(24).text('0-59 Years Old Screened For Visual Activity Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    const allColumns = [
      '#',
      'Full Name',
      'Address',
      'Phone No.',
      'Phil ID',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Marital Status',
      'Suspected Cases',
      'Suspected Cases Referred',
      '1st Visit Date',
      '2nd Visit Date',
      '3rd Visit Date',
      'Vision Test',
      'Referral Options',
      'Remarks',
    ];

    // Split columns into two sets for two pages
    const page1Columns = allColumns.slice(0, 12); // First 12 columns
    const page2Columns = allColumns.slice(12);    // Remaining 11 columns

    // Define column widths in points for each page
    const columnWidthsPage1 = {
      '#': 25,
      'Full Name': 100,
      'Address': 150,
      'Phone No.': 80,
      'Phil ID': 80,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 80,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
    };

    const columnWidthsPage2 = {
      'Indigenous People': 80,
      'Ethnic Group': 80,
      'Marital Status': 80,
      'Suspected Cases': 60,
      'Suspected Cases Referred': 80,
      '1st Visit Date': 80,
      '2nd Visit Date': 80,
      '3rd Visit Date': 80,
      'Vision Test': 80,
      'Referral Options': 120,
      'Remarks': 80,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], 20) // Header row height
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += 20; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell
        let maxHeight = 20; // Minimum row height (same as header)

        // Calculate the required height for each cell and determine the maximum height for the row
        const cellHeights = columns.map((col, idx) => {
          const text = rowData[idx];
          const textHeight = doc.heightOfString(text, { 
            width: columnWidths[col] - (cellPadding * 2), 
            align: 'left', 
            lineBreak: true,
          });
          return Math.ceil(textHeight) + (cellPadding * 2);
        });

        maxHeight = Math.max(...cellHeights, 20); // Ensure a minimum height

        // Draw cells with dynamic height
        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = maxHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Add text with wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += maxHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + maxHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page ${doc.bufferedPageRange().count} of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 50; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const visitDates = safeParseJSON(row.visit_dates);
      const referralOptions = safeParseJSON(row.referral_options, []);

      // Format visit dates
      const visit1 = formatDate(visitDates.visit1);
      const visit2 = formatDate(visitDates.visit2);
      const visit3 = formatDate(visitDates.visit3);

      // Format referral options
      const referralText = Array.isArray(referralOptions) && referralOptions.length > 0
        ? referralOptions.join(', ')
        : 'N/A';

      return {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Phone No.': row.phone_no || 'N/A',
        'Phil ID': row.phil_id || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Marital Status': row.marital_status || 'N/A',
        'Suspected Cases': row.suspected_cases || 'N/A',
        'Suspected Cases Referred': row.suspected_cases_referred || 'N/A',
        '1st Visit Date': visit1,
        '2nd Visit Date': visit2,
        '3rd Visit Date': visit3,
        'Vision Test': row.vision_test || 'N/A',
        'Referral Options': referralText,
        'Remarks': row.remarks || 'N/A',
      };
    });

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, columnWidthsPage1);
    drawTableRows(page1Columns, columnWidthsPage1, preparedData);

    /**
     * Add Page Number for Page 1
     */


    /**
     * Prepare Data for Page 2
     */
    const preparedDataPage2 = preparedData.map(row => {
      // Extract only the columns for page 2
      const page2Row = {};
      page2Columns.forEach(col => {
        page2Row[col] = row[col];
      });
      return page2Row;
    });

    /**
     * Add a new page for Page 2
     */
    doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
    currentY = 50; // Reset Y position for the new page

    // Add Title for Page 2


    /**
     * Draw Table for Page 2
     */
    drawTableHeader(page2Columns, columnWidthsPage2);
    drawTableRows(page2Columns, columnWidthsPage2, preparedDataPage2);

    /**
     * Add Page Number for Page 2
     */


    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});

//==================PRINT 0-59 MONTHS OLD CHILDREN==================================//

app.get('/print/children059', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.phone_no,
      c.phil_id,
      c.gender, 
      c.birthdate, 
      c.age,
      zf.pwd_number,
      zf.mother_name,
      zf.nhts_pr_id,
      zf.cct_id_number,
      zf.phic_id_number,
      zf.indigenous_people,
      zf.ethnic_group,
      zf.nutrition_info,
      zf.remarks
    FROM 
      client_tbl c
    INNER JOIN 
      zero_to_fiftynine_months_children zf
    ON 
      c.id = zf.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = '0-59 Months Old Children'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ZeroFiftyNineMonths_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('0-59 Months Old Children Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    // Define all columns
    const allColumns = [
      '#',
      'Full Name',
      'Address',
      'Phone No.',
      'Phil ID',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'Mother Name',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      '6-11 months old',
      '12-23 months old',
      '24-35 months old',
      '36-47 months old',
      '48-59 months old',
      'Remarks',
    ];

    // Split columns into two sets for two pages
    const page1Columns = allColumns.slice(0, 9); // First 9 columns
    const page2Columns = allColumns.slice(9);    // Remaining 12 columns

    // Define column widths in points
    const columnWidthsPage1 = {
      '#': 30,
      'Full Name': 100,
      'Address': 150,
      'Phone No.': 80,
      'Phil ID': 80,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 100,
    };

    const columnWidthsPage2 = {
      'Mother Name': 100,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
      'Ethnic Group': 100,
      '6-11 months old': 150,
      '12-23 months old': 150,
      '24-35 months old': 150,
      '36-47 months old': 150,
      '48-59 months old': 150,
      'Remarks': 100,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], 40) // Fixed header row height
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += 40; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell
        let maxHeight = 40; // Minimum row height

        // Calculate the required height for each cell and determine the maximum height for the row
        const cellHeights = columns.map((col, idx) => {
          const text = rowData[idx];
          const textHeight = doc.heightOfString(text, { width: columnWidths[col] - (cellPadding * 2), align: 'left', lineBreak: true });
          return Math.ceil(textHeight) + (cellPadding * 2);
        });

        maxHeight = Math.max(...cellHeights, 40); // Ensure a minimum height

        // Draw cells with dynamic height
        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = maxHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Add text with wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += maxHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + 40 > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page ${doc.bufferedPageRange().count} of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data
     */
    const preparedData = results.map((row, index) => {
      // Page 1 Data - First 9 columns
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Phone No.': row.phone_no || 'N/A',
        'Phil ID': row.phil_id || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
      };

      // Page 2 Data - Remaining columns including age groups
      const nutritionInfo = safeParseJSON(row.nutrition_info);

      const formatNutrition = (ageGroup, info) => {
        if (!info) return 'N/A';
        const {
          weight = 'N/A',
          height = 'N/A',
          bmi = 'N/A',
          nutritional_status = 'N/A',
          date_of_measurement = 'N/A',
          vitamin_a_date1 = 'N/A',
          vitamin_a_date2 = 'N/A',
          deworming_dose1_date = 'N/A',
          deworming_dose2_date = 'N/A',
        } = info;

        let text = `Weight kg: ${weight}\nHeight cm: ${height}\nBMI: ${bmi}\nNutritional Status: ${nutritional_status}\nDate of Measurement: ${formatDate(date_of_measurement)}\nVitamin A Given: ${formatDate(vitamin_a_date1)}`;

        if (vitamin_a_date2 && vitamin_a_date2 !== 'N/A') {
          text += `\n2nd Dose Vitamin A Given: ${formatDate(vitamin_a_date2)}`;
        }
        if (deworming_dose1_date && deworming_dose1_date !== 'N/A') {
          text += `\nDeworming 1st Dose: ${formatDate(deworming_dose1_date)}`;
        }
        if (deworming_dose2_date && deworming_dose2_date !== 'N/A') {
          text += `\nDeworming 2nd Dose: ${formatDate(deworming_dose2_date)}`;
        }

        return text;
      };

      const page2Row = {
        'Mother Name': row.mother_name || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        '6-11 months old': formatNutrition('6-11 months old', nutritionInfo['6-11 months old']),
        '12-23 months old': formatNutrition('12-23 months old', nutritionInfo['12-23 months old']),
        '24-35 months old': formatNutrition('24-35 months old', nutritionInfo['24-35 months old']),
        '36-47 months old': formatNutrition('36-47 months old', nutritionInfo['36-47 months old']),
        '48-59 months old': formatNutrition('48-59 months old', nutritionInfo['48-59 months old']),
        'Remarks': row.remarks || 'N/A',
      };

      return { page1: page1Row, page2: page2Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);
    const page2Data = preparedData.map(row => row.page2);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, columnWidthsPage1);
    drawTableRows(page1Columns, columnWidthsPage1, page1Data);

    /**
     * Add Page Number for Page 1

    /**
     * Add a new page for Page 2
     */
    doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
    currentY = 100; // Reset Y position for the new page

    // Add Title for Page 2
    doc.fontSize(16).text('Continued: 0-59 Months Old Children Program Services Report', { align: 'center' });
    doc.moveDown(1);

    /**
     * Draw Table for Page 2
     */
    drawTableHeader(page2Columns, columnWidthsPage2);
    drawTableRows(page2Columns, columnWidthsPage2, page2Data);

    /**
     * Add Page Number for Page 2
     */

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});


//==================print 0-11 MONTHS INFANTS================================//

app.get('/print/infants', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      ze.pwd_number,
      ze.nhts_pr_id,
      ze.cct_id_number,
      ze.phic_id_number,
      ze.indigenous_people,
      ze.ethnic_group,
      ze.low_birth_weight_infants,
      ze.newborn_birth_weight,
      ze.newborn_birth_height,
      ze.infant_underwent_newborn_screening,
      ze.date_of_immunization,
      ze.date_child_reached_one,
      ze.date_child_fully_immunized,
      ze.date_infant_reaches_six_months,
      ze.breastfeeding_details,
      ze.remarks,
      ze.immunizations
    FROM 
      client_tbl c
    INNER JOIN 
      zero_eleven_months ze
    ON 
      c.id = ze.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = '0-11 Months Old Infants'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ZeroElevenMonths_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('0-11 Months Old Infants Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    // Define all columns
    const allColumns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Low Birth Weight Infants',
      'Newborn Birth Weight',
      'Newborn Birth Height',
      'Infant Underwent Newborn Screening',
      'Date Immunization Received',
      'Date Child Reached Age 1',
      'Date Child Fully Immunized',
      'Date Infant Reaches 6 Months',
      'Breastfeeding Details',
      'Remarks',
    ];

    // Split columns into two sets for two pages
    const page1Columns = allColumns.slice(0, 11); // First 11 columns
    const page2Columns = allColumns.slice(11);    // Remaining columns

    /**
     * Define column widths in points
     * Adjusted to fit within A2 landscape paper without design backgrounds
     */
    const columnWidthsPage1 = {
      '#': 30,
      'Full Name': 100,
      'Address': 150,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 100,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
    };

    const columnWidthsPage2 = {
      'Ethnic Group': 100,
      'Low Birth Weight Infants': 100,
      'Newborn Birth Weight': 100,
      'Newborn Birth Height': 100,
      'Infant Underwent Newborn Screening': 120,
      'Date Immunization Received': 200,
      'Date Child Reached Age 1': 100,
      'Date Child Fully Immunized': 100,
      'Date Infant Reaches 6 Months': 100,
      'Breastfeeding Details': 150,
      'Remarks': 100,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          if (col === 'Date Immunization Received') {
            // Special handling for Immunizations JSON
            const parsedImmunizations = safeParseJSON(row[col]);
            const immunizationsText = `
OPV 1: ${formatDate(parsedImmunizations.opv?.dose1)}
OPV 2: ${formatDate(parsedImmunizations.opv?.dose2)}
OPV 3: ${formatDate(parsedImmunizations.opv?.dose3)}
IPV 1: ${formatDate(parsedImmunizations.ipv?.dose1)}
PENTAVALENT 1: ${formatDate(parsedImmunizations.pentavalent?.dose1)}
PENTAVALENT 2: ${formatDate(parsedImmunizations.pentavalent?.dose2)}
PENTAVALENT 3: ${formatDate(parsedImmunizations.pentavalent?.dose3)}
MMR 1: ${formatDate(parsedImmunizations.mmr?.dose1)}
MMR 2: ${formatDate(parsedImmunizations.mmr?.dose2)}
            `.trim();

            doc.text(immunizationsText, currentX + cellPadding, currentY + cellPadding, {
              width: cellWidth - (cellPadding * 2),
              height: cellHeight - (cellPadding * 2),
              align: 'left',
              lineBreak: true,
            });
          } else {
            doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
              width: cellWidth - (cellPadding * 2),
              height: cellHeight - (cellPadding * 2),
              align: 'left',
              lineBreak: true,
            });
          }

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const parsedImmunizations = safeParseJSON(row.immunizations);

      // Format Immunizations Dates
      const immunizations = {
        'OPV 1': formatDate(parsedImmunizations.opv?.dose1),
        'OPV 2': formatDate(parsedImmunizations.opv?.dose2),
        'OPV 3': formatDate(parsedImmunizations.opv?.dose3),
        'IPV 1': formatDate(parsedImmunizations.ipv?.dose1),
        'PENTAVALENT 1': formatDate(parsedImmunizations.pentavalent?.dose1),
        'PENTAVALENT 2': formatDate(parsedImmunizations.pentavalent?.dose2),
        'PENTAVALENT 3': formatDate(parsedImmunizations.pentavalent?.dose3),
        'MMR 1': formatDate(parsedImmunizations.mmr?.dose1),
        'MMR 2': formatDate(parsedImmunizations.mmr?.dose2),
      };

      // Page 1 Data - First 11 columns
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
      };

      // Page 2 Data - Remaining columns
      const page2Row = {
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Low Birth Weight Infants': row.low_birth_weight_infants || 'N/A',
        'Newborn Birth Weight': row.newborn_birth_weight || 'N/A',
        'Newborn Birth Height': row.newborn_birth_height || 'N/A',
        'Infant Underwent Newborn Screening': row.infant_underwent_newborn_screening || 'N/A',
        'Date Immunization Received': immunizations,
        'Date Child Reached Age 1': formatDate(row.date_child_reached_one),
        'Date Child Fully Immunized': formatDate(row.date_child_fully_immunized),
        'Date Infant Reaches 6 Months': formatDate(row.date_infant_reaches_six_months),
        'Breastfeeding Details': row.breastfeeding_details || 'N/A',
        'Remarks': row.remarks || 'N/A',
      };

      return { page1: page1Row, page2: page2Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);
    const page2Data = preparedData.map(row => row.page2);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, columnWidthsPage1);
    drawTableRows(page1Columns, columnWidthsPage1, page1Data);

    /**
     * Add Page Number for Page 1

    /**
     * Add a new page for Page 2
     */
    doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
    currentY = 50; // Reset Y position for the new page

    // Add Title for Page 2

    /**
     * Draw Table for Page 2
     */
    drawTableHeader(page2Columns, columnWidthsPage2);
    drawTableRows(page2Columns, columnWidthsPage2, page2Data);

    /**
     * Add Page Number for Page 2
     */

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});



//====================PRINT CURRENT SOMKERS==================================//

app.get('/print/currentsmokers', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      cs.pwd_number,
      cs.nhts_pr_id,
      cs.cct_id_number,
      cs.phic_id_number,
      cs.indigenous_people,
      cs.ethnic_group,
      cs.marital_status,
      cs.sex,
      cs.suspected_cases,
      cs.suspected_cases_referred
    FROM 
      client_tbl c
    INNER JOIN 
      current_smokers cs
    ON 
      c.id = cs.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Current Smokers'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=CurrentSmokers_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Current Smokers Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    // Page 1 Columns - Basic Client Information and Current Smokers Data
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Marital Status',
      'Sex',
      'Suspected Cases',
      'Suspected Cases Referred',
    ];

    /**
     * Define column widths in points
     * Adjusted to fit within A2 landscape paper without design backgrounds
     */
    const page1ColumnWidths = {
      '#': 30,
      'Full Name': 100,
      'Address': 150,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 100,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
      'Ethnic Group': 100,
      'Marital Status': 80,
      'Sex': 50,
      'Suspected Cases': 80,
      'Suspected Cases Referred': 100,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1
     */
    const preparedData = results.map((row, index) => {
      // Page 1 Data - Basic Client Information and Current Smokers Data
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Marital Status': row.marital_status || 'N/A',
        'Sex': row.sex || 'N/A',
        'Suspected Cases': row.suspected_cases || 'N/A',
        'Suspected Cases Referred': row.suspected_cases_referred || 'N/A',
      };

      return { page1: page1Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, page1ColumnWidths);
    drawTableRows(page1Columns, page1ColumnWidths, page1Data);

    /**
     * Add Page Number for Page 1
     */
    doc.font('Helvetica').fontSize(8).text(`Page 1 of 1`, 0, doc.page.height - 50, {
      align: 'center',
    });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});

//==================PRINT FILARIASIS=============================================//

app.get('/print/filariasis', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      f.pwd_number,
      f.nhts_pr_id,
      f.cct_id_number,
      f.phic_id_number,
      f.indigenous_people,
      f.ethnic_group,
      f.suspect_filaria_cases,
      f.suspect_filaria_cases_referred,
      f.mass_drug_administrations,
      f.additional_notes
    FROM 
      client_tbl c
    INNER JOIN 
      filariasis f
    ON 
      c.id = f.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Filariasis Program Services'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Filariasis_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Filariasis Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    // Page 1 Columns - Basic Client Information and Filariasis Data
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Suspect Filaria Cases',
      'Suspect Filaria Cases Referred',
      'Mass Drug Administrations',
      'Additional Notes',
    ];

    /**
     * Define column widths in points
     * Adjusted to fit within A2 landscape paper without design backgrounds
     */
    const page1ColumnWidths = {
      '#': 30,
      'Full Name': 100,
      'Address': 150,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 100,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
      'Ethnic Group': 100,
      'Suspect Filaria Cases': 100,
      'Suspect Filaria Cases Referred': 150,
      'Mass Drug Administrations': 200,
      'Additional Notes': 150,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const parsedMassDrugAdmins = safeParseJSON(row.mass_drug_administrations);

      // Format Mass Drug Administrations Dates
      const massDrugAdministrations = `
Date Given 1: ${formatDate(parsedMassDrugAdmins.date_given1)}
Date Given 2: ${formatDate(parsedMassDrugAdmins.date_given2)}
Date Given 3: ${formatDate(parsedMassDrugAdmins.date_given3)}
Date Given 4: ${formatDate(parsedMassDrugAdmins.date_given4)}
      `.trim();

      // Page 1 Data - Basic Client Information and Filariasis Data
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Suspect Filaria Cases': row.suspect_filaria_cases || 'N/A',
        'Suspect Filaria Cases Referred': row.suspect_filaria_cases_referred || 'N/A',
        'Mass Drug Administrations': massDrugAdministrations,
        'Additional Notes': row.additional_notes || 'N/A',
      };

      return { page1: page1Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, page1ColumnWidths);
    drawTableRows(page1Columns, page1ColumnWidths, page1Data);

    /**
     * Add Page Number for Page 1
     */
    doc.font('Helvetica').fontSize(8).text(`Page 1 of 1`, 0, doc.page.height - 50, {
      align: 'center',
    });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});


//===================PRINT HYPERTENSIVE DIABETIES===========================//

app.get('/print/hypertensivediabeties', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder to prevent SQL injection
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      h.pwd_number,
      h.nhts_pr_id,
      h.cct_id_number,
      h.phic_id_number,
      h.indigenous_people,
      h.ethnic_group,
      h.civil_status,
      h.height,
      h.weight,
      h.bmi
    FROM 
      client_tbl c
    INNER JOIN 
      hypertensive h
    ON 
      c.id = h.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Hypertensive And Type 2 Diabetes'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=HypertensiveAndType2Diabetes_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Hypertensive And Type 2 Diabetes Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    // Page 1 Columns - Basic Client Information and Hypertensive Data
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Civil Status',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
    ];

    /**
     * Define column widths in points
     * Adjusted to fit within A2 landscape paper without design backgrounds
     */
    const page1ColumnWidths = {
      '#': 30,
      'Full Name': 100,
      'Address': 150,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'PWD Number': 100,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
      'Ethnic Group': 100,
      'Civil Status': 80,
      'Height (cm)': 50,
      'Weight (kg)': 50,
      'BMI': 30,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1
     */
    const preparedData = results.map((row, index) => {
      // Format numerical values
      const height = row.height ? row.height.toString() : 'N/A';
      const weight = row.weight ? row.weight.toString() : 'N/A';
      const bmi = row.bmi ? row.bmi.toFixed(2) : 'N/A';

      // Page 1 Data - Basic Client Information and Hypertensive Data
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Civil Status': row.civil_status || 'N/A',
        'Height (cm)': height,
        'Weight (kg)': weight,
        'BMI': bmi,
      };

      return { page1: page1Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, page1ColumnWidths);
    drawTableRows(page1Columns, page1ColumnWidths, page1Data);

    /**
     * Add Page Number for Page 1
     */
    doc.font('Helvetica').fontSize(8).text(`Page 1 of 1`, 0, doc.page.height - 50, {
      align: 'center',
    });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});

//=====================PRINT FAMILY PLANNING ==========================//

app.get('/print/familyplanning', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      w.nhts_pr_id,
      w.cct_id_number,
      w.phic_id_number,
      w.indigenous_people,
      w.ethnic_group,
      w.civil_status,
      w.height,
      w.weight,
      w.bmi,
      w.no_of_living_children,
      w.educational_attainment,
      w.occupation,
      w.type_of_client
    FROM 
      client_tbl c
    INNER JOIN 
      wra w
    ON 
      c.id = w.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Family Planning'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=FamilyPlanning_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Family Planning Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */
    // Page 1 Columns - Basic Client Information and WRA Data
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Civil Status',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'No. of Living Children',
      'Educational Attainment',
      'Occupation',
      'Type of Client',
    ];

    /**
     * Define column widths in points
     * Adjusted to fit within A2 landscape paper without design backgrounds
     */
    const page1ColumnWidths = {
      '#': 30,
      'Full Name': 100,
      'Address': 150,
      'Gender': 50,
      'Birthdate': 80,
      'Age': 30,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
      'Ethnic Group': 100,
      'Civil Status': 80,
      'Height (cm)': 50,
      'Weight (kg)': 50,
      'BMI': 30,
      'No. of Living Children': 50,
      'Educational Attainment': 100,
      'Occupation': 100,
      'Type of Client': 100,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1
     */
    const preparedData = results.map((row, index) => {
      // Format numerical values
      const height = row.height ? row.height.toString() : 'N/A';
      const weight = row.weight ? row.weight.toString() : 'N/A';
      const bmi = row.bmi ? row.bmi.toFixed(2) : 'N/A';
      const noOfLivingChildren = row.no_of_living_children !== null ? row.no_of_living_children.toString() : 'N/A';

      // Page 1 Data - Basic Client Information and WRA Data
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Civil Status': row.civil_status || 'N/A',
        'Height (cm)': height,
        'Weight (kg)': weight,
        'BMI': bmi,
        'No. of Living Children': noOfLivingChildren,
        'Educational Attainment': row.educational_attainment || 'N/A',
        'Occupation': row.occupation || 'N/A',
        'Type of Client': row.type_of_client || 'N/A',
      };

      return { page1: page1Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, page1ColumnWidths);
    drawTableRows(page1Columns, page1ColumnWidths, page1Data);

    /**
     * Add Page Number for Page 1
     */
    doc.font('Helvetica').fontSize(8).text(`Page 1 of 1`, 0, doc.page.height - 50, {
      align: 'center',
    });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});


//=======================PRINT SENIOR CETIZEN===========================//

app.get('/print/seniorcitizen', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      s.pwd_number,
      s.nhts_pr_id,
      s.cct_id_number,
      s.phic_id_number,
      s.indigenous_people,
      s.ethnic_group,
      s.osca_id_number,
      s.pneumococcal_vaccine,
      s.influenza_vaccine
    FROM 
      client_tbl c
    INNER JOIN 
      senior_citizen s
    ON 
      c.id = s.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Senior Citizen'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=SeniorCitizen_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Senior Citizen Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     */

    // Page 1 Columns - Basic Client Information and Vaccine Dates
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'OSCA ID No.',
      'Pneumococcal Vaccine',
      'Influenza Vaccine',
    ];

    /**
     * Define column widths in points
     * Adjusted to fit within A2 landscape paper without design backgrounds
     */
    const page1ColumnWidths = {
      '#': 50,
      'Full Name': 100,
      'Address': 150,
      'Gender': 70,
      'Birthdate': 80,
      'Age': 50,
      'PWD Number': 100,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 100,
      'Ethnic Group': 100,
      'OSCA ID No.': 100,
      'Pneumococcal Vaccine': 200, // Combined doses
      'Influenza Vaccine': 250,     // Combined doses
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 25; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const parsedPneumococcalVaccine = safeParseJSON(row.pneumococcal_vaccine);
      const parsedInfluenzaVaccine = safeParseJSON(row.influenza_vaccine);

      // Format Pneumococcal Vaccine Dates
      const pneumococcalVaccine = `
1st Dose: ${formatDate(parsedPneumococcalVaccine.first_dose)}
2nd Dose: ${formatDate(parsedPneumococcalVaccine.second_dose)}
      `.trim();

      // Format Influenza Vaccine Dates
      const influenzaVaccine = `
1st Dose: ${formatDate(parsedInfluenzaVaccine.first_dose)}
2nd Dose: ${formatDate(parsedInfluenzaVaccine.second_dose)}
3rd Dose: ${formatDate(parsedInfluenzaVaccine.third_dose)}
4th Dose: ${formatDate(parsedInfluenzaVaccine.fourth_dose)}
      `.trim();

      // Page 1 Data - Basic Client Information and Vaccine Dates
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'PWD Number': row.pwd_number || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Marital Status': row.marital_status || 'N/A',
        'Pneumococcal Vaccine': pneumococcalVaccine,
        'Influenza Vaccine': influenzaVaccine,
      };

      return { page1: page1Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, page1ColumnWidths);
    drawTableRows(page1Columns, page1ColumnWidths, page1Data);

    /**
     * Add Page Number for Page 1
     */
    doc.font('Helvetica').fontSize(8).text(`Page 1 of 1`, 0, doc.page.height - 50, {
      align: 'center',
    });

    /**
     * Finalize PDF and end the stream
     */
    doc.end();
  });
});



//=====================SCHISTOMIASIS PRINT============================//

app.get('/print/schistomiasis', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      s.nhts_pr_id,
      s.cct_id_number,
      s.phic_id_number,
      s.indigenous_people,
      s.ethnic_group,
      s.marital_status,
      s.mass_drug_administration_dates,
      s.suspected_schisto_cases,
      s.suspected_schisto_cases_referred
    FROM 
      client_tbl c
    INNER JOIN 
      schistosomiasis s
    ON 
      c.id = s.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Schistomiasis Program Services'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Use standard A2 size
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Schistomiasis_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Schistomiasis Program Services Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     * Split across two pages
     */

    // Page 1 Columns - Basic Client Information
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Indigenous People',
      'Ethnic Group',
      'Marital Status', 'Mass Drug Admin Date 1',
      'Mass Drug Admin Date 2',
      'Mass Drug Admin Date 3',
      'Mass Drug Admin Date 4',
      'Mass Drug Admin Date 5',
      'Suspected Schisto Cases',
      'Suspected Schisto Cases Referred',

    ];

    // Page 2 Columns - Schistomiasis Specific Data

    /**
     * Define column widths in points (70-100)
     * Adjusted to fit within A2 landscape paper across two pages
     */
    const page1ColumnWidths = {
      '#': 70,
      'Full Name': 100,
      'Address': 100,
      'Gender': 70,
      'Birthdate': 80,
      'Age': 50,
      'NHTS PR ID': 80,
      'CCT ID No.': 80,
      'PHIC ID No.': 80,
      'Indigenous People': 80,
      'Ethnic Group': 80,
      'Marital Status': 80,
      'Mass Drug Admin Date 1': 80,
      'Mass Drug Admin Date 2': 80,
      'Mass Drug Admin Date 3': 80,
      'Mass Drug Admin Date 4': 80,
      'Mass Drug Admin Date 5': 80,
      'Suspected Schisto Cases': 80,
      'Suspected Schisto Cases Referred': 80,
    };


    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 25; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1 and Page 2
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const parsedMassDrugDates = safeParseJSON(row.mass_drug_administration_dates);

      // Format Mass Drug Administration Dates
      const massDrugDates = [
        `Date 1: ${formatDate(parsedMassDrugDates.date1)}`,
        `Date 2: ${formatDate(parsedMassDrugDates.date2)}`,
        `Date 3: ${formatDate(parsedMassDrugDates.date3)}`,
        `Date 4: ${formatDate(parsedMassDrugDates.date4)}`,
        `Date 5: ${formatDate(parsedMassDrugDates.date5)}`,
      ];

      // Page 1 Data - Basic Client Information
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Indigenous People': row.indigenous_people || 'N/A',
        'Ethnic Group': row.ethnic_group || 'N/A',
        'Marital Status': row.marital_status || 'N/A',
        'Mass Drug Admin Date 1': massDrugDates[0],
        'Mass Drug Admin Date 2': massDrugDates[1],
        'Mass Drug Admin Date 3': massDrugDates[2],
        'Mass Drug Admin Date 4': massDrugDates[3],
        'Mass Drug Admin Date 5': massDrugDates[4],
        'Suspected Schisto Cases': row.suspected_schisto_cases || 'N/A',
        'Suspected Schisto Cases Referred': row.suspected_schisto_cases_referred || 'N/A',
      };

      // Page 2 Data - Schistomiasis Specific Data
      

      return { page1: page1Row};
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);

    /**
     * Draw Table for Page 1
     */
    drawTableHeader(page1Columns, page1ColumnWidths);
    drawTableRows(page1Columns, page1ColumnWidths, page1Data);


    doc.end();
  });
});

//========================PRINT PREGNANT===============================//


// Function to safely parse nested JSON strings

/**
 * /print/pregnant Endpoint
 */
app.get('/print/pregnant', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      p.gravida,
      p.parity,
      p.abortion,
      p.stillbirth,
      p.height,
      p.weight,
      p.bmi,
      p.nutritional_status,
      p.nhts_pr_id,
      p.cct_id_number,
      p.phic_id_number,
      p.expected_date_of_confinement,
      p.prenatal_visits,
      p.next_prenatal_visits,
      p.risk_codes,
      p.seen_by,
      p.with_birth_plan,
      p.td_immunizations,
      p.laboratory_examinations,
      p.micronutrient_supplementation,
      p.quality_prenatal_care,
      p.date_of_delivery,
      p.type_of_delivery,
      p.weeks_of_pregnancy,
      p.outcome_of_delivery,
      p.date_breastfeeding_initiated,
      p.postpartum_care_visits,
      p.family_planning,
      p.referred_to_facility
    FROM 
      client_tbl c
    INNER JOIN 
      pregnant_data p
    ON 
      c.id = p.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Pregnant'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A2 landscape orientation and appropriate margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 50, 
      size: 'A2', // Changed from 'C2' to 'A2'
      autoFirstPage: true 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Pregnant_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Pregnant Clients Report', { align: 'center' });
    doc.moveDown(2); // Adds some vertical space

    /**
     * Define Table Columns
     * Split across two pages
     */

    // Page 1 Columns
    const page1Columns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'Gravida',
      'Parity',
      'Abortion',
      'Stillbirth',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'Nutri Status',
      'NHTS PR ID',
      'CCT ID No.',
      'PHIC ID No.',
      'Exp. Date Confinement',
      'Pre Prenatal Visit 1',
      'Pre Prenatal Visit 2',
      'Pre Prenatal Visit 3',
      'Pre Prenatal Visit 4',
    ];

    // Page 2 Columns
    const page2Columns = [
      'Next Prenatal Visit 1',
      'Next Prenatal Visit 2',
      'Next Prenatal Visit 3',
      'Next Prenatal Visit 4',
      'Seen By',
      'With Birth Plan',
      'TD Immunizations',
      'Laboratory Examinations',
      'Micronutrient Supplementation',
      'Quality Prenatal Care',
      'Date of Delivery',
      'Type of Delivery',
      'Weeks Pregnant',
      'Outcome Delivery',
      'Breastfeeding Start',
      'Postpartum Visits',
      'Family Planning',
      'Referred Facility',
    ];

    /**
     * Define column widths in points (70-100)
     * Adjusted to fit within A2 landscape paper across two pages
     */
    const page1ColumnWidths = {
      '#': 70,
      'Full Name': 100,
      'Address': 70,
      'Gender': 70,
      'Birthdate': 70,
      'Age': 70,
      'Gravida': 70,
      'Parity': 70,
      'Abortion': 70,
      'Stillbirth': 70,
      'Height (cm)': 70,
      'Weight (kg)': 70,
      'BMI': 70,
      'Nutri Status': 70,
      'NHTS PR ID': 70,
      'CCT ID No.': 70,
      'PHIC ID No.': 70,
      'Exp. Date Confinement': 70,
      'Pre Prenatal Visit 1': 70,
      'Pre Prenatal Visit 2': 70,
      'Pre Prenatal Visit 3': 70,
      'Pre Prenatal Visit 4': 70,
    };

    const page2ColumnWidths = {
      'Next Prenatal Visit 1': 70,
      'Next Prenatal Visit 2': 70,
      'Next Prenatal Visit 3': 70,
      'Next Prenatal Visit 4': 70,
      'Seen By': 70,
      'With Birth Plan': 70,
      'TD Immunizations': 70,
      'Laboratory Examinations': 140, // Combined multiple fields
      'Micronutrient Supplementation': 140, // Combined multiple fields
      'Quality Prenatal Care': 70,
      'Date of Delivery': 70,
      'Type of Delivery': 70,
      'Weeks Pregnant': 70,
      'Outcome Delivery': 70,
      'Breastfeeding Start': 70,
      'Postpartum Visits': 140, // Combined first and second visits
      'Family Planning': 70,
      'Referred Facility': 70,
    };

    /**
     * Starting position with padding
     */
    const startX = 50; // Left padding
    let currentY = 100; // Top padding after the title
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    /**
     * Function to draw table header with borders
     */
    const drawTableHeader = (columns, columnWidths) => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;

      columns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 2, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });

      currentY += rowHeight; // Move Y position below the header
    };

    /**
     * Function to draw table rows with borders and handle text wrapping
     */
    const drawTableRows = (columns, columnWidths, dataRows) => {
      doc.font('Helvetica').fontSize(fontSize);

      dataRows.forEach((row, index) => {
        // Prepare row data based on columns
        const rowData = columns.map(col => row[col] || 'N/A');

        let currentX = startX;
        const cellPadding = 2; // Padding inside each cell

        columns.forEach((col, idx) => {
          const cellWidth = columnWidths[col];
          const cellHeight = rowHeight;

          // Draw cell border
          doc
            .rect(currentX, currentY, cellWidth, cellHeight)
            .stroke();

          // Handle multi-line text by enabling text wrapping
          doc.text(rowData[idx], currentX + cellPadding, currentY + cellPadding, {
            width: cellWidth - (cellPadding * 2),
            height: cellHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: true,
          });

          currentX += cellWidth;
        });

        currentY += rowHeight; // Move Y position for the next row

        // Check if currentY exceeds the page height minus bottom margin
        if (currentY + rowHeight > doc.page.height - 100) { // 100 points reserved for footer
          // Add page number before adding a new page
          doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
            align: 'center',
          });

          // Add a new page
          doc.addPage({ layout: 'landscape', size: 'A2', margin: 50 });
          currentY = 100; // Reset Y position for the new page

          // Draw header for the new page
          drawTableHeader(columns, columnWidths);
        }
      });
    };

    /**
     * Prepare Data for Page 1 and Page 2
     */
    const preparedData = results.map((row, index) => {
      // Parse JSON fields
      const parsedPrenatalVisits = safeParseJSON(row.prenatal_visits);
      const parsedNextPrenatalVisits = safeParseJSON(row.next_prenatal_visits);
      const parsedTDImmunizations = safeParseJSON(row.td_immunizations);
      const parsedLaboratoryExaminations = safeParseJSON(row.laboratory_examinations);
      const parsedMicronutrientSupplementation = safeParseJSON(row.micronutrient_supplementation);
      const parsedPostpartumCareVisits = safeParseJSON(row.postpartum_care_visits);

      // Page 1 Data
      const page1Row = {
        '#': index + 1,
        'Full Name': row.fname || 'N/A',
        'Address': row.address || 'N/A',
        'Gender': row.gender || 'N/A',
        'Birthdate': formatDate(row.birthdate),
        'Age': row.age || 'N/A',
        'Gravida': row.gravida || 'N/A',
        'Parity': row.parity || 'N/A',
        'Abortion': row.abortion || 'N/A',
        'Stillbirth': row.stillbirth || 'N/A',
        'Height (cm)': row.height || 'N/A',
        'Weight (kg)': row.weight || 'N/A',
        'BMI': row.bmi || 'N/A',
        'Nutri Status': row.nutritional_status || 'N/A',
        'NHTS PR ID': row.nhts_pr_id || 'N/A',
        'CCT ID No.': row.cct_id_number || 'N/A',
        'PHIC ID No.': row.phic_id_number || 'N/A',
        'Exp. Date Confinement': formatDate(row.expected_date_of_confinement),
        'Pre Prenatal Visit 1': formatDate(parsedPrenatalVisits.visit1),
        'Pre Prenatal Visit 2': formatDate(parsedPrenatalVisits.visit2),
        'Pre Prenatal Visit 3': formatDate(parsedPrenatalVisits.visit3),
        'Pre Prenatal Visit 4': formatDate(parsedPrenatalVisits.visit4),
      };

      // Page 2 Data
      const page2Row = {
        'Next Prenatal Visit 1': formatDate(parsedNextPrenatalVisits.next_visit1),
        'Next Prenatal Visit 2': formatDate(parsedNextPrenatalVisits.next_visit2),
        'Next Prenatal Visit 3': formatDate(parsedNextPrenatalVisits.next_visit3),
        'Next Prenatal Visit 4': formatDate(parsedNextPrenatalVisits.next_visit4),
        'Seen By': row.seen_by || 'N/A',
        'With Birth Plan': row.with_birth_plan || 'N/A',
        'TD Immunizations': `Previous: ${formatDate(parsedTDImmunizations.previous)}\nCurrent: ${formatDate(parsedTDImmunizations.current)}`,
        'Laboratory Examinations': `Hemoglobin: ${formatDate(parsedLaboratoryExaminations.hemoglobin)}\nBlood Typing: ${formatDate(parsedLaboratoryExaminations.blood_typing)}\nUrinalysis: ${formatDate(parsedLaboratoryExaminations.urinalysis)}\nOther Exams: ${formatDate(parsedLaboratoryExaminations.other_examinations)}`,
        'Micronutrient Supplementation': `Iron MMS Date: ${formatDate(parsedMicronutrientSupplementation.iron_with_mms_date)}\nIron MMS Tablets: ${parsedMicronutrientSupplementation.iron_with_mms_tablets || 'N/A'}\nCalcium Carbonate Date: ${formatDate(parsedMicronutrientSupplementation.calcium_carbonate_date)}\nCalcium Carbonate Tablets: ${parsedMicronutrientSupplementation.calcium_carbonate_tablets || 'N/A'}\nIodine Date: ${formatDate(parsedMicronutrientSupplementation.iodine_date)}\nIodine Tablets: ${parsedMicronutrientSupplementation.iodine_tablets || 'N/A'}\nDeworming Date: ${formatDate(parsedMicronutrientSupplementation.deworming_date)}\nDeworming Tablets: ${parsedMicronutrientSupplementation.deworming_tablets || 'N/A'}`,
        'Quality Prenatal Care': row.quality_prenatal_care || 'N/A',
        'Date of Delivery': formatDate(row.date_of_delivery),
        'Type of Delivery': row.type_of_delivery || 'N/A',
        'Weeks Pregnant': row.weeks_of_pregnancy || 'N/A',
        'Outcome Delivery': row.outcome_of_delivery || 'N/A',
        'Breastfeeding Start': formatDate(row.date_breastfeeding_initiated),
        'Postpartum Visits': `First Visit: ${formatDate(parsedPostpartumCareVisits.first_visit)}\nSecond Visit: ${formatDate(parsedPostpartumCareVisits.second_visit)}`,
        'Family Planning': row.family_planning || 'N/A',
        'Referred Facility': row.referred_to_facility || 'N/A',
      };

      return { page1: page1Row, page2: page2Row };
    });

    /**
     * Separate Data for Each Page
     */
    const page1Data = preparedData.map(row => row.page1);
    const page2Data = preparedData.map(row => row.page2);

/**
 * Draw Table for Page 1
 */
drawTableHeader(page1Columns, page1ColumnWidths);
drawTableRows(page1Columns, page1ColumnWidths, page1Data);

/**
 * Add Page Number for Page 1
 */
doc.font('Helvetica').fontSize(8).text(`Page 1 of 2`, 0, doc.page.height - 50, {
  align: 'center',
});

/**
 * Add a New Page for Page 2

/**
 * Draw Table for Page 2
 */
drawTableHeader(page2Columns, page2ColumnWidths);
drawTableRows(page2Columns, page2ColumnWidths, page2Data);

/**
 * Add Page Number for Page 2


/**
 * Finalize PDF and end the stream
 */
doc.end();
});

});
//========================PRINT PERSON WITH DISABILITES======================//

app.get('/print/personwithdisability', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // SQL Query with ? placeholder
  const query = `
    SELECT 
      c.fname, 
      c.address, 
      c.gender, 
      c.birthdate, 
      c.age,
      p.pwd_number,
      p.nhts_pr_id,
      p.cct_id_number,
      p.phic_id_number,
      p.indigenous_people,
      p.ethnic_group,
      p.civil_status,
      p.height,
      p.weight,
      p.bmi,
      p.educational_attainment,
      p.occupation,
      p.employment_status,
      p.type_of_disability
    FROM 
      client_tbl c
    INNER JOIN 
      person_with_disability p
    ON 
      c.id = p.client_id
    WHERE 
      c.worker_id = ?
      AND c.category_name = 'Person With Disabilities'
  `;

  // Execute the query with the provided worker_id
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: 'Failed to execute query.' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No data found for the given worker_id.' });
    }

    // Initialize PDF Document with A3 landscape orientation and no margins
    const doc = new PDFDocument({ 
      layout: 'landscape', 
      margin: 0, 
      size: 'C3', // Use A3 paper size
      autoFirstPage: true 
    });

    // No need to add a new page since autoFirstPage is true
    // doc.addPage();

    // Set response headers
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=PersonWithDisability_Report.pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add Title
    const titleY = 50;
    doc.fontSize(20).text('Person With Disabilities Report',0, titleY, { align: 'center' });
    doc.moveDown(0);

    // Define Table Columns
    const tableColumns = [
      '#',
      'Full Name',
      'Address',
      'Gender',
      'Birthdate',
      'Age',
      'PWD Number',
      'NHTS PR ID',
      'CCT ID Number',
      'PHIC ID Number',
      'Indigenous People',
      'Ethnic Group',
      'Civil Status',
      'Height',
      'Weight',
      'BMI',
      'Educational Attainment',
      'Occupation',
      'Employment Status',
      'Type of Disability',
    ];

    // Define column widths in points (1 inch = 72 points)
    // Ensure that every column in tableColumns has a corresponding key in columnWidths
    const columnWidths = {
      '#': 25,
      'Full Name': 80,
      'Address': 120,
      'Gender': 40,
      'Birthdate': 60,
      'Age': 30,
      'PWD Number': 60,
      'NHTS PR ID': 70, // Increased to prevent wrapping
      'CCT ID Number': 70, // Increased to prevent wrapping
      'PHIC ID Number': 70, // Increased to prevent wrapping
      'Indigenous People': 60,
      'Ethnic Group': 60,
      'Civil Status': 60,
      'Height': 40,
      'Weight': 40,
      'BMI': 30,
      'Educational Attainment': 80,
      'Occupation': 80,
      'Employment Status': 80,
      'Type of Disability': 80,
    };

    // Starting position with padding
    const startX = 20; // Padding from the left
    const startY = 80; // Padding from the top
    const rowHeight = 20; // Height of each row
    const fontSize = 8;

    // Function to draw table header with borders
    const drawTableHeader = () => {
      doc.font('Helvetica-Bold').fontSize(fontSize);
      let currentX = startX;
      let currentY = startY;

      // Draw Header Cells
      tableColumns.forEach(col => {
        doc
          .rect(currentX, currentY, columnWidths[col], rowHeight)
          .stroke()
          .text(col, currentX + 2, currentY + 5, {
            width: columnWidths[col] - 4,
            align: 'left',
            ellipsis: true,
          });
        currentX += columnWidths[col];
      });
    };

    // Function to draw table rows with borders
    const drawTableRows = () => {
      doc.font('Helvetica').fontSize(fontSize);
      results.forEach((row, index) => {
        const currentY = startY + rowHeight + (index * rowHeight);
        let currentX = startX;

        // Check if we need a new page
        if (currentY + rowHeight > doc.page.height - 50) { // Adjusted for bottom padding
          doc.addPage({ layout: 'landscape', margin: 0 });
          drawTableHeader();
          // Reset rowY for the new page
          return; // Proceed to the next iteration to start drawing rows on the new page
        }

        // Row Number and Data
        const rowData = [
          index + 1,
          row.fname || 'N/A',
          row.address || 'N/A',
          row.gender || 'N/A',
          formatDate(row.birthdate),
          row.age || 'N/A',
          row.pwd_number || 'N/A',
          row.nhts_pr_id || 'N/A',
          row.cct_id_number || 'N/A',
          row.phic_id_number || 'N/A',
          row.indigenous_people || 'N/A',
          row.ethnic_group || 'N/A',
          row.civil_status || 'N/A',
          row.height || 'N/A',
          row.weight || 'N/A',
          row.bmi || 'N/A',
          row.educational_attainment || 'N/A',
          row.occupation || 'N/A',
          row.employment_status || 'N/A',
          row.type_of_disability || 'N/A',
        ];

        tableColumns.forEach((col, idx) => {
          doc
            .rect(currentX, currentY, columnWidths[col], rowHeight)
            .stroke()
            .text(rowData[idx], currentX + 2, currentY + 5, {
              width: columnWidths[col] - 4,
              align: 'left',
              ellipsis: true,
            });
          currentX += columnWidths[col];
        });
      });
    };

    // Helper function to format dates
    const formatDate = (date) => {
      const d = new Date(date);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    };

    // Draw Header
    drawTableHeader();

    // Draw Rows
    drawTableRows();

    // Finalize PDF and end the stream
    doc.end();
  });
});


//=============================== MEDICATION NOTIFCATION ==================//

app.post('/pregnant/set-next-visit-date', (req, res) => {
  const { nextPrenatalVisitDate } = req.body;

  if (!nextPrenatalVisitDate) {
    return res.status(400).json({ error: 'Next Prenatal Visit Date is required.' });
  }

  const setDate = new Date(nextPrenatalVisitDate);
  if (isNaN(setDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format.' });
  }

  const query = 'INSERT INTO system_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?';
  db.query(query, ['next_prenatal_visit_date', nextPrenatalVisitDate, nextPrenatalVisitDate], (err, result) => {
    if (err) {
      console.error('Error saving next prenatal visit date:', err);
      return res.status(500).json({ error: 'Error saving next prenatal visit date.' });
    }
    res.status(200).json({ message: 'Next prenatal visit date set successfully.' });
  });
});

// New Route: Get Next Prenatal Visit Date
app.get('/pregnant/get-next-visit-date', (req, res) => {
  const query = 'SELECT `value` FROM system_settings WHERE `key` = ?';
  db.query(query, ['next_prenatal_visit_date'], (err, results) => {
    if (err) {
      console.error('Error fetching next prenatal visit date:', err);
      return res.status(500).json({ error: 'Error fetching next prenatal visit date.' });
    }
    if (results.length > 0) {
      res.status(200).json({ nextPrenatalVisitDate: results[0].value });
    } else {
      res.status(200).json({ nextPrenatalVisitDate: null });
    }
  });
});

// New Route: Check Missed Visits
app.post('/pregnant/check-missed-visits', (req, res) => {
  const { nextPrenatalVisitDate } = req.body;

  if (!nextPrenatalVisitDate) {
    return res.status(400).json({ error: 'Next Prenatal Visit Date is required.' });
  }

  const setDate = new Date(nextPrenatalVisitDate);
  if (isNaN(setDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format.' });
  }

  // Save the date in the system_settings table
  const saveDateQuery = 'INSERT INTO system_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?';
  db.query(saveDateQuery, ['next_prenatal_visit_date', nextPrenatalVisitDate, nextPrenatalVisitDate], (err, result) => {
    if (err) {
      console.error('Error saving next prenatal visit date:', err);
      return res.status(500).json({ error: 'Error saving next prenatal visit date.' });
    }

    // Proceed to check for missed visits

    // Fetch all pregnant_data with client names
    const query = `
      SELECT pregnant_data.*, client_tbl.fname
      FROM pregnant_data
      JOIN client_tbl ON pregnant_data.client_id = client_tbl.id
    `;
    db.query(query, [], async (err, results) => {
      if (err) {
        console.error('Error fetching pregnant_data:', err);
        return res.status(500).json({ error: 'Error fetching pregnant data.' });
      }

      const notificationsToInsert = [];

      for (const data of results) {
        const clientId = data.client_id;
        const clientName = data.fname; // Client's name
        const workerId = data.worker_id; // Assuming worker_id is the recipient

        let nextPrenatalVisits;
        try {
          nextPrenatalVisits = JSON.parse(data.next_prenatal_visits || '{}');
        } catch (e) {
          console.error('Error parsing next_prenatal_visits for client_id', clientId, e);
          nextPrenatalVisits = {};
        }

        // Define maximum number of visits, assuming 4
        const maxVisits = 4;

        for (let i = 1; i <= maxVisits; i++) {
          const visitKey = `visit${i}`;
          const nextVisitKey = `next_visit${i}`;
          const visitDoneKey = `${visitKey}_done`;

          const nextVisitDate = nextPrenatalVisits[nextVisitKey] ? new Date(nextPrenatalVisits[nextVisitKey]) : null;

          if (nextVisitDate && setDate < nextVisitDate) {
            // Check if visitX is completed
            const visitDone = data[visitDoneKey] === 1; // Assuming 1 = done, 0 = not done

            if (!visitDone) {
              // Create notification message
              const notificationMessage = `Missed Visit Schedule: ${clientName} has missed ${visitKey} scheduled on ${nextVisitDate.toLocaleDateString()}.`;

              // Check for existing notification
              const checkQuery = 'SELECT * FROM notifications WHERE worker_id = ? AND message = ? AND visit_number = ? AND `read` = 0';
              const existingNotifications = await new Promise((resolve, reject) => {
                db.query(checkQuery, [workerId, notificationMessage, i], (checkErr, checkResults) => {
                  if (checkErr) {
                    console.error('Error checking existing notifications:', checkErr);
                    return reject(checkErr);
                  }
                  resolve(checkResults);
                });
              });

              if (existingNotifications.length === 0) {
                // No existing notification, proceed to add
                notificationsToInsert.push([workerId, notificationMessage, new Date(), i]);
              }
            }
          }
        }
      }

      if (notificationsToInsert.length > 0) {
        const insertQuery = 'INSERT INTO notifications (worker_id, message, date, visit_number) VALUES ?';
        db.query(insertQuery, [notificationsToInsert], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Error inserting notifications:', insertErr);
            return res.status(500).json({ error: 'Error inserting notifications.' });
          }

          res.status(200).json({ message: `${notificationsToInsert.length} notification(s) created successfully.` });
        });
      } else {
        res.status(200).json({ message: 'No missed visits detected.' });
      }
    });
  });
});

// New Route: Fetch Notifications
app.get('/notifications', (req, res) => {
  const workerId = req.query.worker_id;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required.' });
  }

  const query = 'SELECT * FROM notifications WHERE worker_id = ? AND `read` = 0';
  db.query(query, [workerId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: 'Error fetching notifications.' });
    }

    res.status(200).json(results);
  });
});

// New Route: Mark Notifications as Read
app.put('/notifications/mark-as-read', (req, res) => {
  const { worker_id } = req.body;

  if (!worker_id) {
    return res.status(400).json({ error: 'worker_id is required.' });
  }

  const query = 'UPDATE notifications SET `read` = 1 WHERE worker_id = ? AND `read` = 0';
  db.query(query, [worker_id], (err, result) => {
    if (err) {
      console.error('Error marking notifications as read:', err);
      return res.status(500).json({ error: 'Error marking notifications as read.' });
    }

    res.status(200).json({ message: 'Notifications marked as read successfully.' });
  });
});


//=============================== OVER VIEW DASHBOARD WORKER SIDE==================//


app.get('/count-total-clients', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ?
  `;
  const params = [workerId];

  // Apply month and year filters if provided
  query = appendDateFilter(query, month, year, params, 'date_registered');

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching total clients:', err);
      return res.status(500).json({ error: 'Failed to fetch total clients' });
    }
    console.log('Total Clients Query Result:', results[0]);
    res.json(results[0]);
  });
});

/**
 * 2. Get Count of Male Clients
 * Supports optional month and year filters
 */
app.get('/count-male-clients', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT COUNT(*) AS maleClients
    FROM client_tbl
    WHERE worker_id = ? AND LOWER(gender) = 'male'
  `;
  const params = [workerId];

  // Apply month and year filters if provided
  query = appendDateFilter(query, month, year, params, 'date_registered');

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching male clients:', err);
      return res.status(500).json({ error: 'Failed to fetch male clients' });
    }
    console.log('Male Clients Query Result:', results[0]);
    res.json(results[0]);
  });
});

/**
 * 3. Get Count of Female Clients
 * Supports optional month and year filters
 */
app.get('/count-female-clients', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT COUNT(*) AS femaleClients
    FROM client_tbl
    WHERE worker_id = ? AND LOWER(gender) = 'female'
  `;
  const params = [workerId];

  // Apply month and year filters if provided
  query = appendDateFilter(query, month, year, params, 'date_registered');

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching female clients:', err);
      return res.status(500).json({ error: 'Failed to fetch female clients' });
    }
    console.log('Female Clients Query Result:', results[0]);
    res.json(results[0]);
  });
});

/**
 * 4. Get Recent Clients (Registered within the last week)
 * Supports optional month and year filters. If filters are provided, the one-week filter is ignored.
 */
app.get('/recent-clients', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT fname, category_name, date_registered
    FROM client_tbl
    WHERE worker_id = ?
  `;
  const params = [workerId];

  if (month || year) {
    // Apply month and/or year filters if provided
    query = appendDateFilter(query, month, year, params, 'date_registered');
  } else {
    // Otherwise, apply the one-week filter
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const formattedDate = oneWeekAgo.toISOString().split('T')[0];
    query += ` AND date_registered >= ?`;
    params.push(formattedDate);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching recent clients:', err);
      return res.status(500).json({ error: 'Failed to fetch recent clients' });
    }
    res.json(results);
  });
});

/**
 * 5. Get New Registered Clients Over Time
 * Supports optional month and year filters
 */
app.get('/new-registered', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT DATE_FORMAT(date_registered, '%Y-%m-%d') AS day, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ?
  `;
  const params = [workerId];

  // Apply month and year filters if provided
  query = appendDateFilter(query, month, year, params, 'date_registered');

  query += `
    GROUP BY day
    ORDER BY day
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching client data:', err);
      return res.status(500).json({ error: 'Failed to fetch client data' });
    }
    res.json(results);
  });
});

/**
 * 6. Get Category Count
 * Supports optional month and year filters
 */
app.get('/category-count', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT category_name, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ?
  `;
  const params = [workerId];

  // Apply month and year filters if provided
  query = appendDateFilter(query, month, year, params, 'date_registered');

  query += `
    GROUP BY category_name
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching category data:', err);
      return res.status(500).json({ error: 'Failed to fetch category data' });
    }
    res.json(results);
  });
});

/**
 * 7. Get Age Segmentation Data
 * Supports optional month and year filters
 */
app.get('/age-segmentation', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT
      CASE
        WHEN age BETWEEN 0 AND 17 THEN '0-17'
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 35 THEN '26-35'
        WHEN age BETWEEN 36 AND 45 THEN '36-45'
        WHEN age BETWEEN 46 AND 60 THEN '46-60'
        ELSE '60+'
      END AS ageGroup,
      SUM(CASE WHEN LOWER(gender) = 'male' THEN 1 ELSE 0 END) AS male,
      SUM(CASE WHEN LOWER(gender) = 'female' THEN 1 ELSE 0 END) AS female
    FROM client_tbl
    WHERE worker_id = ?
  `;
  const params = [workerId];

  // Apply month and year filters if provided
  query = appendDateFilter(query, month, year, params, 'date_registered');

  query += `
    GROUP BY ageGroup
    ORDER BY 
      CASE 
        WHEN ageGroup = '0-17' THEN 1
        WHEN ageGroup = '18-25' THEN 2
        WHEN ageGroup = '26-35' THEN 3
        WHEN ageGroup = '36-45' THEN 4
        WHEN ageGroup = '46-60' THEN 5
        ELSE 6
      END
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching age segmentation data:', err);
      return res.status(500).json({ error: 'Failed to fetch age segmentation data' });
    }
    res.json(results);
  });
});

/**
 * 8. Get Updates Line Graph Data
 * Supports optional month and year filters
 */
app.get('/updates-line-graph', (req, res) => {
  const workerId = req.query.worker_id;
  const { month, year } = req.query;

  if (!workerId) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  let query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS count
    FROM (
      SELECT updated_at FROM current_smokers WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM filariasis WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM five_nine_children WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM hypertensive WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM person_with_disability WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM pregnant_data WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM schistosomiasis WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM senior_citizen WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM ten_to_nineteen WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM wra WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM zero_eleven_months WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM zero_to_fiftynine WHERE worker_id = ?
      UNION ALL
      SELECT updated_at FROM zero_to_fiftynine_months_children WHERE worker_id = ?
    ) AS combined_updates
    WHERE 1=1
  `;
  const params = Array(13).fill(workerId); // Assuming 13 tables

  // Apply month and year filters if provided
  if (month && year) {
    query += ` AND MONTH(updated_at) = ? AND YEAR(updated_at) = ?`;
    params.push(parseInt(month, 10), parseInt(year, 10));
  } else if (year) {
    query += ` AND YEAR(updated_at) = ?`;
    params.push(parseInt(year, 10));
  } else if (month) {
    query += ` AND MONTH(updated_at) = ?`;
    params.push(parseInt(month, 10));
  }

  query += `
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching updates data:', err);
      return res.status(500).json({ error: 'Failed to fetch updates data' });
    }
    res.json(results);
  });
});


//============================WORKER PREGNANT DASHBOARD=========================//

app.get("/pregnant/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender = 'female'
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Female)
 * Route: GET /pregnant/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/pregnant/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender = 'female'
    GROUP BY age
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Female)
 * Route: GET /pregnant/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/pregnant/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender = 'female'
    GROUP BY DAY(date_registered)
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /pregnant/pregnant-data
 * Query Parameters: worker_id
 */
app.get("/pregnant/pregnant-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM pregnant_data
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching pregnant data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//==========================WORKER PERSON WITH DISABILITIES DASHBOARD===================//


app.get("/person-with-disabilities/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender`;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 */
app.get("/person-with-disabilities/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender`;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 */
app.get("/person-with-disabilities/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender`;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients from person_with_disabilities_data
 */
app.get("/person-with-disabilities/person-with-disabilities-data", (req, res) => {
  const { worker_id } = req.query;

  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM person_with_disability
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC`;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching person with disabilities data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

//============================== WORKER SCHISTOMIASIS DASHBOARD=====================//

app.get("/schistomiasis/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender`;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 */
app.get("/schistomiasis/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender`;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 */
app.get("/schistomiasis/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender`;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients from schistomiasis_data
 */
app.get("/schistomiasis/schistomiasis-data", (req, res) => {
  const { worker_id } = req.query;

  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM schistosomiasis
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC`;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching schistomiasis data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

//=========================== FAMILY PLANNING WORKER DASHBOARD ====================//

app.get("/familyplanning/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /familyplanning/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/familyplanning/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /familyplanning/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/familyplanning/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /familyplanning/familyplanning-data
 * Query Parameters: worker_id
 */
app.get("/familyplanning/familyplanning-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM wra
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching familyplanning data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});



//=============================SENIOR CETIZEN WORKER DASHBOARD===================//

app.get("/seniorcetizen/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /seniorcetizen/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/seniorcetizen/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /seniorcetizen/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/seniorcetizen/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /seniorcetizen/seniorcetizen-data
 * Query Parameters: worker_id
 */
app.get("/seniorcetizen/seniorcetizen-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM senior_citizen
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching seniorcetizen data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});
//==========================HYPERTENSIVE DIABETIES WORKER DASHBOARD=============//


  app.get("/hypertensivediabeties/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /hypertensivediabeties/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/hypertensivediabeties/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /hypertensivediabeties/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/hypertensivediabeties/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /hypertensivediabeties/hypertensivediabeties-data
 * Query Parameters: worker_id
 */
app.get("/hypertensivediabeties/hypertensivediabeties-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM hypertensive
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching hypertensivediabeties data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//===========================FILARIASIS WOKRER DASHBOARD========================//


app.get("/filariasis/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /filariasis/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/filariasis/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /filariasis/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/filariasis/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /filariasis/filariasis-data
 * Query Parameters: worker_id
 */
app.get("/filariasis/filariasis-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM filariasis
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching filariasis data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//=========================CURRENT SMOKERS WORKER DASHBOARD=====================//


app.get("/currentsmokers/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /currentsmokers/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/currentsmokers/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /currentsmokers/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/currentsmokers/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /currentsmokers/currentsmokers-data
 * Query Parameters: worker_id
 */
app.get("/currentsmokers/currentsmokers-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM current_smokers
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching currentsmokers data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//=======================0-11 INFANTS WORKER DASHBOARD==================//

app.get("/infants/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /infants/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/infants/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /infants/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/infants/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /infants/infants-data
 * Query Parameters: worker_id
 */
app.get("/infants/infants-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM zero_eleven_months
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching infants data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//========================0-59 MONTHS CHILDREN WORKER DASHBOARD =================//


app.get("/children059/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /children059/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/children059/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /children059/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/children059/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /children059/children059-data
 * Query Parameters: worker_id
 */
app.get("/children059/children059-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM zero_to_fiftynine_months_children
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching children059 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//===========================WORKER 0-59 MONTHS OLD SCREENED VISUAL ACTIVITY DASHBOARD====================//


app.get("/screened059/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /screened059/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/screened059/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /screened059/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/screened059/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /screened059/screened059-data
 * Query Parameters: worker_id
 */
app.get("/screened059/screened059-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM zero_to_fiftynine
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching screened059 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//====================5-9 YEARS OLD CHILDREN WORKER DASHBOARD =====================//

app.get("/children5to9/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /children5to9/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/children5to9/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /children5to9/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/children5to9/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /children5to9/children5to9-data
 * Query Parameters: worker_id
 */
app.get("/children5to9/children5to9-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM five_nine_children
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching children5to9 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});
//============================10-19 YEARS OLD WORKER DASHBOARD =================//

app.get("/children10to19/count-total-clients", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /children10to19/age-segmentation
 * Query Parameters: worker_id, category_name
 */
app.get("/children10to19/age-segmentation", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /children10to19/new-registered
 * Query Parameters: worker_id, category_name
 */
app.get("/children10to19/new-registered", (req, res) => {
  const { worker_id, category_name } = req.query;

  // Validate required parameters
  if (!worker_id || !category_name) {
    return res.status(400).json({ error: "worker_id and category_name are required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE worker_id = ? AND category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /children10to19/children10to19-data
 * Query Parameters: worker_id
 */
app.get("/children10to19/children10to19-data", (req, res) => {
  const { worker_id } = req.query;

  // Validate required parameter
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required" });
  }

  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM ten_to_nineteen
    WHERE worker_id = ?
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, [worker_id], (err, results) => {
    if (err) {
      console.error("Error fetching children10to19 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});


//=============================ADMIN OVERVIEW DASHBOARD==========================//
/**
 * Utility Function to Append Date Filters
 * @param {string} baseQuery - The base SQL query.
 * @param {string} month - The month to filter by (1-12).
 * @param {string} year - The year to filter by (e.g., 2023).
 * @param {Array} params - The array to push query parameters into.
 * @returns {string} - The modified SQL query with date filters.
 */
const appendDateFilter = (baseQuery, month, year, params) => {
  if (month && year) {
    baseQuery += ` AND MONTH(date_registered) = ? AND YEAR(date_registered) = ?`;
    params.push(parseInt(month, 10), parseInt(year, 10));
  } else if (year) {
    baseQuery += ` AND YEAR(date_registered) = ?`;
    params.push(parseInt(year, 10));
  } else if (month) {
    // If only month is provided, filter by month across all years
    baseQuery += ` AND MONTH(date_registered) = ?`;
    params.push(parseInt(month, 10));
  }
  return baseQuery;
};

/**
 * 1. Get Count of Total Clients
 */
app.get('/admin/count-total-clients', (req, res) => {
  const { month, year } = req.query;
  let query = `SELECT COUNT(*) AS totalClients FROM client_tbl WHERE 1=1`;
  const params = [];

  query = appendDateFilter(query, month, year, params);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching total clients:', err);
      return res.status(500).json({ error: 'Failed to fetch total clients' });
    }
    res.json(results[0]);
  });
});

/**
 * 2. Get Count of Male Clients
 * 
 * Note: Removed date filters since 'user_tbl' does not have 'date_registered'.
 */
app.get('/admin/count-male-clients', (req, res) => {
  const query = `
    SELECT COUNT(*) AS maleClients
    FROM user_tbl
    WHERE LOWER(gender) = 'male' AND LOWER(status) = 'active'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching male clients:', err);
      return res.status(500).json({ error: 'Failed to fetch male clients' });
    }
    res.json(results[0]);
  });
});

/**
 * 3. Get Count of Female Clients
 * 
 * Note: Removed date filters since 'user_tbl' does not have 'date_registered'.
 */
app.get('/admin/count-female-clients', (req, res) => {
  const query = `
    SELECT COUNT(*) AS femaleClients
    FROM user_tbl
    WHERE LOWER(gender) = 'female' AND LOWER(status) = 'active'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching female clients:', err);
      return res.status(500).json({ error: 'Failed to fetch female clients' });
    }
    res.json(results[0]);
  });
});

/**
 * 4. Get Recent Clients (Registered within the last week)
 */
app.get('/admin/recent-clients', (req, res) => {
  const { month, year } = req.query;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const formattedDate = oneWeekAgo.toISOString().split('T')[0];

  let query = `
    SELECT fname, category_name, date_registered
    FROM client_tbl
    WHERE date_registered >= ?
  `;
  const params = [formattedDate];

  query = appendDateFilter(query, month, year, params);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching recent clients:', err);
      return res.status(500).json({ error: 'Failed to fetch recent clients' });
    }
    res.json(results);
  });
});

/**
 * 5. Get New Registered Clients Over Time
 */
app.get('/admin/new-registered', (req, res) => {
  const { month, year } = req.query;
  let query = `
    SELECT DATE_FORMAT(date_registered, '%Y-%m-%d') AS day, COUNT(*) AS count
    FROM client_tbl
    WHERE 1=1
  `;
  const params = [];

  query = appendDateFilter(query, month, year, params);

  query += `
    GROUP BY day
    ORDER BY day
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching new registered clients:', err);
      return res.status(500).json({ error: 'Failed to fetch new registered clients' });
    }
    res.json(results);
  });
});

/**
 * 6. Get Category Count
 * 
 * Note: Assuming category counts are not dependent on registration dates.
 * If they are, apply the date filters similarly.
 */
app.get('/admin/category-count', (req, res) => {
  let query = `
    SELECT category_name, COUNT(*) AS count
    FROM client_tbl
    GROUP BY category_name
  `;
  const params = [];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching category data:', err);
      return res.status(500).json({ error: 'Failed to fetch category data' });
    }
    res.json(results);
  });
});

/**
 * 7. Get Age Segmentation Data
 * 
 * **Updated:** Now applies month and year filters.
 */
app.get('/admin/age-segmentation', (req, res) => {
  const { month, year } = req.query;
  let query = `
    SELECT
      CASE
        WHEN age BETWEEN 0 AND 17 THEN '0-17'
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 35 THEN '26-35'
        WHEN age BETWEEN 36 AND 45 THEN '36-45'
        WHEN age BETWEEN 46 AND 60 THEN '46-60'
        ELSE '60+'
      END AS ageGroup,
      SUM(CASE WHEN LOWER(gender) = 'male' THEN 1 ELSE 0 END) AS male,
      SUM(CASE WHEN LOWER(gender) = 'female' THEN 1 ELSE 0 END) AS female
    FROM client_tbl
    WHERE 1=1
  `;
  const params = [];

  query = appendDateFilter(query, month, year, params);

  query += `
    GROUP BY ageGroup
    ORDER BY 
      CASE 
        WHEN ageGroup = '0-17' THEN 1
        WHEN ageGroup = '18-25' THEN 2
        WHEN ageGroup = '26-35' THEN 3
        WHEN ageGroup = '36-45' THEN 4
        WHEN ageGroup = '46-60' THEN 5
        ELSE 6
      END
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching age segmentation data:', err);
      return res.status(500).json({ error: 'Failed to fetch age segmentation data' });
    }
    res.json(results);
  });
});

/**
 * 8. Get Updates Line Graph Data
 * 
 * Note: Assuming all the involved tables have an 'updated_at' field.
 * Apply date filters only if applicable.
 */
app.get('/admin/updates-line-graph', (req, res) => {
  const { month, year } = req.query;
  let query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS count
    FROM (
      SELECT updated_at FROM current_smokers
      UNION ALL
      SELECT updated_at FROM filariasis
      UNION ALL
      SELECT updated_at FROM five_nine_children
      UNION ALL
      SELECT updated_at FROM hypertensive
      UNION ALL
      SELECT updated_at FROM person_with_disability
      UNION ALL
      SELECT updated_at FROM pregnant_data
      UNION ALL
      SELECT updated_at FROM schistosomiasis
      UNION ALL
      SELECT updated_at FROM senior_citizen
      UNION ALL
      SELECT updated_at FROM ten_to_nineteen
      UNION ALL
      SELECT updated_at FROM wra
      UNION ALL
      SELECT updated_at FROM zero_eleven_months
      UNION ALL
      SELECT updated_at FROM zero_to_fiftynine
      UNION ALL
      SELECT updated_at FROM zero_to_fiftynine_months_children
    ) AS combined_updates
    WHERE 1=1
  `;
  const params = [];

  // Apply date filters if provided
  if (month && year) {
    query += ` AND MONTH(updated_at) = ? AND YEAR(updated_at) = ?`;
    params.push(parseInt(month, 10), parseInt(year, 10));
  } else if (year) {
    query += ` AND YEAR(updated_at) = ?`;
    params.push(parseInt(year, 10));
  } else if (month) {
    query += ` AND MONTH(updated_at) = ?`;
    params.push(parseInt(month, 10));
  }

  query += `
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching updates data:', err);
      return res.status(500).json({ error: 'Failed to fetch updates data' });
    }
    res.json(results);
  });
});

/**
 * 9. Get Count of Medicines
 * 
 * Note: Medicines count is independent of date filters.
 */
app.get('/admin/count-medicines', (req, res) => {
  const query = `SELECT COUNT(*) AS count FROM medicines`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total medicines:', err);
      return res.status(500).json({ error: 'Failed to fetch total medicines' });
    }
    res.json(results[0]);
  });
});

/**
 * 10. Get Count of Workers
 * 
 * Note: Workers count is independent of date filters.
 */
app.get('/admin/count-worker', (req, res) => {
  const query = `
    SELECT COUNT(*) AS totalWorkers 
    FROM user_tbl 
    WHERE LOWER(role) = 'worker' AND LOWER(status) = 'active'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total workers:', err);
      return res.status(500).json({ error: 'Failed to fetch total workers' });
    }
    console.log('Total Workers:', results[0].totalWorkers); // Log the count
    res.json(results[0]);
  });
});

//========================PREGNANT ADMIN DASHBOARD =============================//

// Endpoint: Count Total Clients (Female)
app.get("/admin/pregnant/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender = 'female'
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Female)
 * Route: GET /admin/pregnant/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/pregnant/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender = 'female'
    GROUP BY age
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Female)
 * Route: GET /admin/pregnant/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/pregnant/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender = 'female'
    GROUP BY DAY(date_registered)
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/pregnant/pregnant-data
 * Query Parameters: none
 */
app.get("/admin/pregnant/pregnant-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM pregnant_data
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching pregnant data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//===========================ADMIN PERSON WITH DISABILITIES DASHBOARDD=====================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/person-with-disabilities/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender`;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/person-with-disabilities/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/person-with-disabilities/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender`;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/person-with-disabilities/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/person-with-disabilities/new-registered", (req, res) => {
  const { category_name } = req.query;

  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender`;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients from person_with_disabilities_data
 * Route: GET /admin/person-with-disabilities/person-with-disabilities-data
 * Query Parameters: none
 */
app.get("/admin/person-with-disabilities/person-with-disabilities-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM person_with_disability
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching person with disabilities data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

//===========================ADMIN SCHISTOMIASIS DASHBOARD===========================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/schistomiasis/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender`;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/schistomiasis/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/schistomiasis/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender`;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/schistomiasis/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/schistomiasis/new-registered", (req, res) => {
  const { category_name } = req.query;

  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender`;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients from schistomiasis_data
 * Route: GET /admin/schistomiasis/schistomiasis-data
 * Query Parameters: none
 */
app.get("/admin/schistomiasis/schistomiasis-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM schistosomiasis
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching schistomiasis data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});


//======================ADMIN SENIOR CETIZEN DASHBOARD===========================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/seniorcetizen/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/seniorcetizen/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/seniorcetizen/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/seniorcetizen/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/seniorcetizen/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/seniorcetizen/seniorcetizen-data
 * Query Parameters: none
 */
app.get("/admin/seniorcetizen/seniorcetizen-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM senior_citizen
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching senior citizen data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

//========================= ADMIN FAMILY PLANNING DASHBOARD=========================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/familyplanning/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/familyplanning/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/familyplanning/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/familyplanning/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/familyplanning/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/familyplanning/familyplanning-data
 * Query Parameters: none
 */
app.get("/admin/familyplanning/familyplanning-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM wra
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching family planning data:", err);
      return res.status(500).send("Error fetching data.");
    }
    res.json(results);
  });
});
//==========================ADMIN HYPERTENSIVE AND DIABETIES DASHBOARD===============//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/hypertensivediabeties/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/hypertensivediabeties/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/hypertensivediabeties/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/hypertensivediabeties/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/hypertensivediabeties/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/hypertensivediabeties/hypertensivediabeties-data
 * Query Parameters: none
 */
app.get("/admin/hypertensivediabeties/hypertensivediabeties-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM hypertensive
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching hypertensivediabeties data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});
//===================ADMIN FILARIASIS DASHBOARD==============================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/filariasis/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/filariasis/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/filariasis/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/filariasis/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/filariasis/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/filariasis/filariasis-data
 * Query Parameters: none
 */
app.get("/admin/filariasis/filariasis-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM filariasis
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching filariasis data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//=========================ADMIN CURRENT SOMOKERS DASHOARD=======================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/currentsmokers/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/currentsmokers/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/currentsmokers/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/currentsmokers/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/currentsmokers/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/currentsmokers/currentsmokers-data
 * Query Parameters: none
 */
app.get("/admin/currentsmokers/currentsmokers-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM current_smokers
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching currentsmokers data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});
//==================== ADMIN 0-11 MONTHS OLD DASHBOARD==============================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/infants/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/infants/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/infants/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/infants/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/infants/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/infants/infants-data
 * Query Parameters: none
 */
app.get("/admin/infants/infants-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM zero_eleven_months
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching infants data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//-===================== ADMIN 0-59 MONTHS OLD CHILDREN DASHBOOARD=================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/children059/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/children059/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/children059/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/children059/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/children059/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/children059/children059-data
 * Query Parameters: none
 */
app.get("/admin/children059/children059-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM zero_to_fiftynine_months_children
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching children059 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});
//======================= 0-59 MONTHS OLD SCREENED FOR VISUAL ACTIVITY======================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/screened059/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/screened059/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/screened059/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/screened059/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/screened059/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/screened059/screened059-data
 * Query Parameters: none
 */
app.get("/admin/screened059/screened059-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM zero_to_fiftynine
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching screened059 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//==========================ADMIN 5-9 YEARS OLD DASHBOARD========================//


// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/children5to9/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/children5to9/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/children5to9/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/children5to9/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/children5to9/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/children5to9/children5to9-data
 * Query Parameters: none
 */
app.get("/admin/children5to9/children5to9-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM five_nine_children
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching children5to9 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

//=======================ADMIN 10-19 YEARS OLD DASHBOARD======================//

// Endpoint: Count Total Clients (Male and Female)
app.get("/admin/children10to19/count-total-clients", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT gender, COUNT(*) AS totalClients
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching total clients:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Age Segmentation (Male and Female)
 * Route: GET /admin/children10to19/age-segmentation
 * Query Parameters: category_name
 */
app.get("/admin/children10to19/age-segmentation", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT age AS age_range, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY age, gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching age segmentation:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: New Registered Clients (Male and Female)
 * Route: GET /admin/children10to19/new-registered
 * Query Parameters: category_name
 */
app.get("/admin/children10to19/new-registered", (req, res) => {
  const { category_name } = req.query;

  // Validate required parameter
  if (!category_name) {
    return res.status(400).json({ error: "category_name is required" });
  }

  const query = `
    SELECT DAY(date_registered) AS day, gender, COUNT(*) AS count
    FROM client_tbl
    WHERE category_name = ? AND gender IN ('male', 'female')
    GROUP BY DAY(date_registered), gender
  `;

  db.query(query, [category_name], (err, results) => {
    if (err) {
      console.error("Error fetching new registrations:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});

/**
 * Endpoint: Updated Clients Data
 * Route: GET /admin/children10to19/children10to19-data
 * Query Parameters: none
 */
app.get("/admin/children10to19/children10to19-data", (req, res) => {
  const query = `
    SELECT DATE(updated_at) AS date, COUNT(*) AS client_count
    FROM ten_to_nineteen
    GROUP BY DATE(updated_at)
    ORDER BY DATE(updated_at) ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching children10to19 data:", err);
      return res.status(500).json({ error: "Error fetching data." });
    }
    res.json(results);
  });
});


//==============================MEDICINES INVENTORY================================//

app.post("/medicines", upload.single("image"), (req, res) => {
  // rename 'expirationDate' -> 'expiration_date'
  const { name, category, quantity, expirationDate } = req.body;
  const expiration_date = expirationDate; 
  const image = req.file ? req.file.filename : "";

  if (!name || !category || !quantity || !expiration_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO medicines (name, category, quantity, expiration_date, image)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [name, category, quantity, expiration_date, image];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error("Error adding medicine:", error);
      return res.status(500).json({ error: "Internal server error while adding medicine" });
    }

    // return the newly inserted medicine
    res.status(201).json({
      id: results.insertId,
      name,
      category,
      quantity,
      expiration_date,
      image,
    });
  });
});


// Endpoint to get all medicines
app.get('/medicines', (req, res) => {
  const query = `SELECT * FROM medicines`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching medicines:', error);
      return res.status(500).json({ error: 'Internal server error while fetching medicines' });
    }
    res.json(results);
  });
});

// Endpoint to update a medicine
app.put("/medicines/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  let { name, category, quantity, expirationDate } = req.body;

  // Basic validation
  if (!name || !category || !quantity || !expirationDate) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Reformat date from ISO to YYYY-MM-DD
  const dateObj = new Date(expirationDate);
  const expiration_date = dateObj.toISOString().split("T")[0];

  // Handle uploaded file
  const image = req.file ? req.file.filename : null;

  // Build the query
  let query = `
    UPDATE medicines
    SET name = ?, category = ?, quantity = ?, expiration_date = ?
  `;
  const values = [name, category, quantity, expiration_date];

  if (image) {
    query += ", image = ? WHERE id = ?";
    values.push(image, id);
  } else {
    query += " WHERE id = ?";
    values.push(id);
  }

  db.query(query, values, (error, results) => {
    if (error) {
      console.error("Error updating medicine:", error);
      return res
        .status(500)
        .json({ error: "Internal server error while updating medicine" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    // Return updated data
    res.json({
      id,
      name,
      category,
      quantity,
      expiration_date,
      image,
    });
  });
});


// Endpoint to delete a medicine
app.delete('/medicines/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM medicines WHERE id = ?`;

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error deleting medicine:', error);
      return res.status(500).json({ error: 'Internal server error while deleting medicine' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.status(204).send();
  });
});

//================================PERGNANT FORM===================================/
app.get('/pregnant-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM pregnant_data WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});


// POST route to create new data
app.post('/pregnant', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO pregnant_data (
      worker_id,
      client_id,
      indigenous_people,
      ethnic_group,
      gravida,
      parity,
      abortion,
      stillbirth,
      height,
      weight,
      bmi,
      nutritional_status,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      expected_date_of_confinement,
      prenatal_visits,
      next_prenatal_visits,
      risk_codes,
      seen_by,
      with_birth_plan,
      td_immunizations,
      laboratory_examinations,
      micronutrient_supplementation,
      quality_prenatal_care,
      date_of_delivery,
      type_of_delivery,
      weeks_of_pregnancy,
      outcome_of_delivery,
      date_breastfeeding_initiated,
      postpartum_care_visits,
      family_planning,
      referred_to_facility,
      created_at,
      updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
    )
  `;

  // Ensure 'referred_to_facility' is provided; default to empty string if undefined
  const referredToFacility = formData.referred_to_facility || '';

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.indigenous_people ? 1 : 0,
    formData.indigenous_people ? formData.ethnic_group : null,
    formData.gravida ? 1 : 0,
    formData.parity ? 1 : 0,
    formData.abortion ? 1 : 0,
    formData.stillbirth ? 1 : 0,
    formData.height,
    formData.weight,
    formData.bmi,
    formData.nutritional_status,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.expected_date_of_confinement,
    JSON.stringify(formData.prenatal_visits),
    JSON.stringify(formData.next_prenatal_visits),
    formData.risk_codes,
    formData.seen_by,
    formData.with_birth_plan ? 1 : 0,
    JSON.stringify(formData.td_immunizations),
    JSON.stringify(formData.laboratory_examinations),
    JSON.stringify(formData.micronutrient_supplementation),
    formData.quality_prenatal_care,
    formData.date_of_delivery,
    formData.type_of_delivery,
    formData.weeks_of_pregnancy,
    formData.outcome_of_delivery,
    formData.date_breastfeeding_initiated,
    JSON.stringify(formData.postpartum_care_visits),
    formData.family_planning,
    referredToFacility,
  ];

  // Validate the length of the values array
  const expectedPlaceholders = 33; // Number of placeholders in the VALUES clause
  if (values.length !== expectedPlaceholders) {
    console.error(`Expected ${expectedPlaceholders} values, but got ${values.length}.`);
    return res.status(500).json({ error: 'Internal server error: Incorrect number of values.' });
  }

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
    } else {
      res.status(200).json({ message: 'Data inserted successfully' });
    }
  });
});



// PUT route to update existing data
app.put('/pregnant/:id', (req, res) => {
  const { id } = req.params;
  // We clone the incoming data so we can safely modify it
  const formData = { ...req.body };

  // A helper function to safely convert a string like "2025-02-06T00:00:00.000Z" -> "2025-02-06"
  function toMySQLDate(value) {
    if (!value) return null; // or "0000-00-00" if you prefer
    const dateObj = new Date(value);
    // If invalid date, return "0000-00-00" or null
    if (isNaN(dateObj.getTime())) return null;
    return dateObj.toISOString().split('T')[0];
  }

  // Convert any date fields that MySQL expects in DATE format:
  formData.expected_date_of_confinement = toMySQLDate(formData.expected_date_of_confinement);
  formData.date_of_delivery = toMySQLDate(formData.date_of_delivery);
  formData.date_breastfeeding_initiated = toMySQLDate(formData.date_breastfeeding_initiated);

  // ... and so on for other DATE columns

  const query = `
    UPDATE pregnant_data SET
      worker_id = ?,
      client_id = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      gravida = ?,
      parity = ?,
      abortion = ?,
      stillbirth = ?,
      height = ?,
      weight = ?,
      bmi = ?,
      nutritional_status = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      expected_date_of_confinement = ?,
      prenatal_visits = ?,
      next_prenatal_visits = ?,
      risk_codes = ?,
      seen_by = ?,
      with_birth_plan = ?,
      td_immunizations = ?,
      laboratory_examinations = ?,
      micronutrient_supplementation = ?,
      quality_prenatal_care = ?,
      date_of_delivery = ?,
      type_of_delivery = ?,
      weeks_of_pregnancy = ?,
      outcome_of_delivery = ?,
      date_breastfeeding_initiated = ?,
      postpartum_care_visits = ?,
      family_planning = ?,
      referred_to_facility = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.indigenous_people ? 1 : 0,
    formData.indigenous_people ? formData.ethnic_group : null,
    formData.gravida ? 1 : 0,
    formData.parity ? 1 : 0,
    formData.abortion ? 1 : 0,
    formData.stillbirth ? 1 : 0,
    formData.height,
    formData.weight,
    formData.bmi,
    formData.nutritional_status,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.expected_date_of_confinement,
    JSON.stringify(formData.prenatal_visits),
    JSON.stringify(formData.next_prenatal_visits),
    formData.risk_codes,
    formData.seen_by,
    formData.with_birth_plan ? 1 : 0,
    JSON.stringify(formData.td_immunizations),
    JSON.stringify(formData.laboratory_examinations),
    JSON.stringify(formData.micronutrient_supplementation),
    formData.quality_prenatal_care,
    formData.date_of_delivery,
    formData.type_of_delivery,
    formData.weeks_of_pregnancy,
    formData.outcome_of_delivery,
    formData.date_breastfeeding_initiated,
    JSON.stringify(formData.postpartum_care_visits),
    formData.family_planning,
    formData.referred_to_facility,
    id,
  ];

  // Double-check number of placeholders
  const expectedPlaceholders = 34;
  if (values.length !== expectedPlaceholders) {
    console.error(
      `Expected ${expectedPlaceholders} values, but got ${values.length}.`
    );
    return res
      .status(500)
      .json({ error: 'Internal server error: Incorrect number of values.' });
  }

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Error updating data' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.status(200).json({ message: 'Data updated successfully' });
  });
});




//============================PERSON WITH DISABILITIES MEDICATION FORM =================//


// Existing POST route to create new data
app.post('/person_with_disability', (req, res) => {
  const {
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmi,
    educational_attainment,
    occupation,
    employment_status,
    type_of_disability
  } = req.body;

  const bmiDecimal = parseFloat(bmi).toFixed(2);

  const query = `
    INSERT INTO person_with_disability (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      civil_status,
      height,
      weight,
      bmi,
      educational_attainment,
      occupation,
      employment_status,
      type_of_disability,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmiDecimal,
    educational_attainment,
    occupation,
    employment_status,
    type_of_disability
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// Existing GET route to fetch data by client_id
app.get('/person_with_disability/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM person_with_disability
    WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.status(200).json(results);
    }
  });
});

// New PUT route to update existing data
app.put('/person_with_disability/:id', (req, res) => {
  const { id } = req.params;

  const {
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmi,
    educational_attainment,
    occupation,
    employment_status,
    type_of_disability
  } = req.body;

  const bmiDecimal = parseFloat(bmi).toFixed(2);

  const query = `
    UPDATE person_with_disability SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      civil_status = ?,
      height = ?,
      weight = ?,
      bmi = ?,
      educational_attainment = ?,
      occupation = ?,
      employment_status = ?,
      type_of_disability = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmiDecimal,
    educational_attainment,
    occupation,
    employment_status,
    type_of_disability,
    id
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});

app.get('/wra/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM wra
    WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.status(200).json(results);
    }
  });
});

//=========================WRA MEDICATION FORM= ===============================//

// Existing POST route to create new WRA data
app.post('/wra', (req, res) => {
  const {
    worker_id,
    client_id,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmi, // Added BMI field
    no_of_living_children,
    educational_attainment,
    occupation,
    type_of_client,
  } = req.body;

  const bmiDecimal = parseFloat(bmi).toFixed(2); // Ensure BMI is a decimal with two decimal places

  const query = `
    INSERT INTO wra (
      worker_id,
      client_id,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      civil_status,
      height,
      weight,
      bmi, -- Added BMI field
      no_of_living_children,
      educational_attainment,
      occupation,
      type_of_client,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    worker_id,
    client_id,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmiDecimal, // Include BMI value
    no_of_living_children,
    educational_attainment,
    occupation,
    type_of_client,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// Existing PUT route to update existing WRA data
app.put('/wra/:id', (req, res) => {
  const { id } = req.params;

  const {
    worker_id,
    client_id,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmi, // Added BMI field
    no_of_living_children,
    educational_attainment,
    occupation,
    type_of_client,
  } = req.body;

  const bmiDecimal = parseFloat(bmi).toFixed(2); // Ensure BMI is a decimal with two decimal places

  const query = `
    UPDATE wra SET
      worker_id = ?,
      client_id = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      civil_status = ?,
      height = ?,
      weight = ?,
      bmi = ?, -- Added BMI field
      no_of_living_children = ?,
      educational_attainment = ?,
      occupation = ?,
      type_of_client = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    worker_id,
    client_id,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmiDecimal, // Include BMI value
    no_of_living_children,
    educational_attainment,
    occupation,
    type_of_client,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});

//===========================HYPERTENSION FORM==============================//

// POST route to create new Hypertensive data
// POST route to create new Hypertensive data
app.post('/hypertensive', (req, res) => {
  const {
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmi,
  } = req.body;

  const bmiDecimal = parseFloat(bmi).toFixed(2); // Ensure BMI is a decimal with two decimal places

  const query = `
    INSERT INTO hypertensive (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      civil_status,
      height,
      weight,
      bmi,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmiDecimal,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});


// PUT route to update existing Hypertensive data
// PUT route to update existing Hypertensive data
app.put('/hypertensive/:id', (req, res) => {
  const { id } = req.params;

  const {
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmi,
  } = req.body;

  const bmiDecimal = parseFloat(bmi).toFixed(2); // Ensure BMI is a decimal with two decimal places

  const query = `
    UPDATE hypertensive SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      civil_status = ?,
      height = ?,
      weight = ?,
      bmi = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    worker_id,
    client_id,
    pwd_number,
    nhts_pr_id,
    cct_id_number,
    phic_id_number,
    indigenous_people,
    ethnic_group,
    civil_status,
    height,
    weight,
    bmiDecimal,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});


app.get('/hypertensive-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM hypertensive
    WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.status(200).json(results);
    }
  });
});
//================================SEIOR CETIZEN==================================//
app.get('/senior-citizen/clients', (req, res) => {
  const { worker_id, category_name } = req.query;

  if (!worker_id || !category_name) {
    return res.status(400).json({ error: 'worker_id and category_name are required' });
  }

  const query = `
    SELECT * 
    FROM client_tbl 
    WHERE worker_id = ? AND category_name = ?
  `;

  db.query(query, [worker_id, category_name], (err, results) => {
    if (err) {
      console.error('Error fetching clients:', err);
      return res.status(500).json({ error: 'Failed to fetch clients' });
    }

    res.json(results);
  });
});


app.get('/senior-citizen-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM senior_citizen WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new data
app.post('/senior-citizen', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO senior_citizen (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      osca_id_number,
      pneumococcal_vaccine,
      influenza_vaccine,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.osca_id_number,
    JSON.stringify(formData.pneumococcal_vaccine),
    JSON.stringify(formData.influenza_vaccine),
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// PUT route to update existing data
app.put('/senior-citizen/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE senior_citizen SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      osca_id_number = ?,
      pneumococcal_vaccine = ?,
      influenza_vaccine = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.osca_id_number,
    JSON.stringify(formData.pneumococcal_vaccine),
    JSON.stringify(formData.influenza_vaccine),
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});



//===============================10-19 YEARS OLD FORM===============================//

app.get('/10-19yo-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM ten_to_nineteen WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new data
app.post('/10-19yo', (req, res) => {
  const formData = req.body;

  // Prepare the query and values
  const query = `
    INSERT INTO ten_to_nineteen (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      height,
      weight,
      bmi,
      educational_status,
      age_details,
      immunization_services,
      additional_comments,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.height,
    formData.weight,
    formData.bmi,
    formData.educational_status,
    JSON.stringify(formData.ageDetails),
    JSON.stringify(formData.immunizationServices),
    formData.additional_comments,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// PUT route to update existing data
app.put('/10-19yo/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE ten_to_nineteen SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      height = ?,
      weight = ?,
      bmi = ?,
      educational_status = ?,
      age_details = ?,
      immunization_services = ?,
      additional_comments = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.height,
    formData.weight,
    formData.bmi,
    formData.educational_status,
    JSON.stringify(formData.ageDetails),
    JSON.stringify(formData.immunizationServices),
    formData.additional_comments,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});

//===========================FILARIASIS FORM================================//

app.get('/filariasis-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM filariasis WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new data
app.post('/filariasis', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO filariasis (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      suspect_filaria_cases,
      suspect_filaria_cases_referred,
      mass_drug_administrations,
      additional_notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.suspect_filaria_cases,
    formData.suspect_filaria_cases_referred,
    JSON.stringify(formData.mass_drug_administrations),
    formData.additional_notes,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// PUT route to update existing data
app.put('/filariasis/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE filariasis SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      suspect_filaria_cases = ?,
      suspect_filaria_cases_referred = ?,
      mass_drug_administrations = ?,
      additional_notes = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.suspect_filaria_cases,
    formData.suspect_filaria_cases_referred,
    JSON.stringify(formData.mass_drug_administrations),
    formData.additional_notes,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});

//==========================5-9 YEARS OLD FORM===============================//


app.get('/5-9yearsold-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM five_nine_children WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new data
app.post('/5-9yearsold', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO five_nine_children (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      height,
      weight,
      bmi,
      educational_status,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.height,
    formData.weight,
    formData.bmi,
    formData.educational_status,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// PUT route to update existing data
app.put('/5-9yearsold/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE five_nine_children SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      height = ?,
      weight = ?,
      bmi = ?,
      educational_status = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.height,
    formData.weight,
    formData.bmi,
    formData.educational_status,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});

//===============================0-11 MONTHS OLD INFANTS =========================//

app.get('/0-11monthsold-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM zero_eleven_months WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new data
app.post('/0-11monthsold', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO zero_eleven_months (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      low_birth_weight_infants,
      newborn_birth_weight,
      newborn_birth_height,
      infant_underwent_newborn_screening,
      date_of_immunization,
      date_child_reached_one,
      date_child_fully_immunized,
      date_infant_reaches_six_months,
      breastfeeding_details,
      remarks,
      immunizations,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.low_birth_weight_infants,
    formData.newborn_birth_weight,
    formData.newborn_birth_height,
    formData.infant_underwent_newborn_screening,
    formData.date_of_immunization,
    formData.date_child_reached_one,
    formData.date_child_fully_immunized,
    formData.date_infant_reaches_six_months,
    formData.breastfeeding_details,
    formData.remarks,
    formData.immunizations, // JSON string
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});

// PUT route to update existing data
app.put('/0-11monthsold/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE zero_eleven_months SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      low_birth_weight_infants = ?,
      newborn_birth_weight = ?,
      newborn_birth_height = ?,
      infant_underwent_newborn_screening = ?,
      date_of_immunization = ?,
      date_child_reached_one = ?,
      date_child_fully_immunized = ?,
      date_infant_reaches_six_months = ?,
      breastfeeding_details = ?,
      remarks = ?,
      immunizations = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.low_birth_weight_infants,
    formData.newborn_birth_weight,
    formData.newborn_birth_height,
    formData.infant_underwent_newborn_screening,
    formData.date_of_immunization,
    formData.date_child_reached_one,
    formData.date_child_fully_immunized,
    formData.date_infant_reaches_six_months,
    formData.breastfeeding_details,
    formData.remarks,
    formData.immunizations, // JSON string
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).send('Data updated successfully');
      }
    }
  });
});


//=====================Current Smokers form ==================================//


app.get('/currentsmokers-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM current_smokers WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new Current Smokers data
app.post('/currentsmokers', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO current_smokers (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      marital_status,
      sex,
      suspected_cases,
      suspected_cases_referred,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.marital_status,
    formData.sex,
    formData.suspected_cases,
    formData.suspected_cases_referred,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).json({ message: 'Data inserted successfully' });
    }
  });
});

// PUT route to update existing Current Smokers data
app.put('/currentsmokers/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE current_smokers SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      marital_status = ?,
      sex = ?,
      suspected_cases = ?,
      suspected_cases_referred = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.marital_status,
    formData.sex,
    formData.suspected_cases,
    formData.suspected_cases_referred,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).json({ message: 'Data updated successfully' });
      }
    }
  });
});

//=============================== Schistosomiasis FORM =======================//

app.get('/schistosomiasis-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM schistosomiasis WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new Schistosomiasis data
app.post('/schistosomiasis', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO schistosomiasis (
      worker_id,
      client_id,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      marital_status,
      mass_drug_administration_dates,
      suspected_schisto_cases,
      suspected_schisto_cases_referred,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.marital_status,
    formData.mass_drug_administration_dates,
    formData.suspected_schisto_cases,
    formData.suspected_schisto_cases_referred,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).json({ message: 'Data inserted successfully' });
    }
  });
});

// PUT route to update existing Schistosomiasis data
app.put('/schistosomiasis/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE schistosomiasis SET
      worker_id = ?,
      client_id = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      marital_status = ?,
      mass_drug_administration_dates = ?,
      suspected_schisto_cases = ?,
      suspected_schisto_cases_referred = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.marital_status,
    formData.mass_drug_administration_dates,
    formData.suspected_schisto_cases,
    formData.suspected_schisto_cases_referred,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).json({ message: 'Data updated successfully' });
      }
    }
  });
});
//=========================0-59YEARS OLD =====================================//

app.get('/zero_to_fiftynine-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM zero_to_fiftynine WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});

// POST route to create new 0-59 Years Old data
app.post('/zero_to_fiftynine', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO zero_to_fiftynine (
      worker_id,
      client_id,
      pwd_number,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      marital_status,
      suspected_cases,
      suspected_cases_referred,
      visit_dates,
      vision_test,
      referral_options,
      remarks,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.marital_status,
    formData.suspected_cases,
    formData.suspected_cases_referred,
    formData.visit_dates,
    formData.vision_test,
    formData.referral_options,
    formData.remarks,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).json({ message: 'Data inserted successfully' });
    }
  });
});


// PUT route to update existing 0-59 Years Old data
// PUT route to update existing 0-59 Years Old data
app.put('/zero_to_fiftynine/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE zero_to_fiftynine SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      marital_status = ?,
      suspected_cases = ?,
      suspected_cases_referred = ?,
      visit_dates = ?,
      vision_test = ?,
      referral_options = ?,
      remarks = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.marital_status,
    formData.suspected_cases,
    formData.suspected_cases_referred,
    formData.visit_dates,
    formData.vision_test,
    formData.referral_options,
    formData.remarks,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).json({ message: 'Data updated successfully' });
      }
    }
  });
});


//===============================0-59 children form ==========================//

app.get('/zero_to_ninechildmonths-form/:client_id', (req, res) => {
  const { client_id } = req.params;

  const query = `
    SELECT * FROM zero_to_fiftynine_months_children WHERE client_id = ?
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.post('/zero_to_fiftynine_months_children', (req, res) => {
  const formData = req.body;

  const query = `
    INSERT INTO zero_to_fiftynine_months_children (
      worker_id,
      client_id,
      pwd_number,
      mother_name,
      nhts_pr_id,
      cct_id_number,
      phic_id_number,
      indigenous_people,
      ethnic_group,
      nutrition_info,
      remarks,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.mother_name,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.nutrition_info,
    formData.remarks,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).json({ message: 'Data inserted successfully' });
    }
  });
});

// PUT route to update existing data
app.put('/zero_to_fiftynine_months_children/:id', (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const query = `
    UPDATE zero_to_fiftynine_months_children SET
      worker_id = ?,
      client_id = ?,
      pwd_number = ?,
      mother_name = ?,
      nhts_pr_id = ?,
      cct_id_number = ?,
      phic_id_number = ?,
      indigenous_people = ?,
      ethnic_group = ?,
      nutrition_info = ?,
      remarks = ?,
      updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    formData.worker_id,
    formData.client_id,
    formData.pwd_number,
    formData.mother_name,
    formData.nhts_pr_id,
    formData.cct_id_number,
    formData.phic_id_number,
    formData.indigenous_people ? 1 : 0,
    formData.ethnic_group,
    formData.nutrition_info,
    formData.remarks,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send('Record not found');
      } else {
        res.status(200).json({ message: 'Data updated successfully' });
      }
    }
  });
});

//================================SEND SMS===================================//

// Function to send SMS using Semaphore API
app.post('/send-sms', async (req, res) => {
    const { number, message, worker_id } = req.body;  // Assuming worker_id is passed with the request

    if (!number || !message || !worker_id) {
        return res.status(400).json({ error: 'Missing phone number, message, or worker_id.' });
    }

    try {
        // Send SMS via Semaphore API
        const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
            apikey: 'f5657a354d9943879c8ac1762b058b35', // Replace with your actual Semaphore API key
            number,
            message,
            sendername: 'MalagosHC' // Replace with your registered sender name
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // If the SMS was sent successfully, insert the message into the database
        const insertQuery = "INSERT INTO sms_tbl (worker_id, message, date_send) VALUES (?, ?, NOW())";
        db.query(insertQuery, [worker_id, message], (err, results) => {
            if (err) {
                console.error('Error inserting message into database:', err);
                return res.status(500).json({ error: 'Failed to store message in the database.', details: err });
            }
            return res.status(200).json({ message: 'SMS sent and stored successfully!', data: response.data });
        });

    } catch (error) {
        console.error('Error sending SMS:', error);
        if (error.response) {
            return res.status(500).json({ error: 'Failed to send SMS', details: error.response.data });
        } else {
            return res.status(500).json({ error: 'No response from Semaphore' });
        }
    }
});

// GET request to fetch SMS messages from database
// GET request to fetch SMS messages from database filtered by worker_id
// GET request to fetch SMS messages from database filtered by worker_id
app.get('/sms-messages', (req, res) => {
    const { worker_id } = req.query;  // Assuming worker_id is passed as a query parameter

    if (!worker_id) {
        // Return error if worker_id is not specified
        return res.status(400).json({ error: 'worker_id is required to fetch messages.' });
    }

    // Query to fetch messages specific to the worker_id
    const query = `
        SELECT message, DATE_FORMAT(date_send, '%Y-%m-%d %H:%i:%s') AS date_send 
        FROM sms_tbl 
        WHERE worker_id = ? 
        ORDER BY date_send DESC`;

    db.query(query, [worker_id], (err, results) => {
        if (err) {
            console.error('Error fetching messages from database:', err);
            return res.status(500).json({ error: 'Failed to retrieve messages from database', details: err });
        }
        return res.status(200).json(results);
    });
});





//================================UPDATE CLIENTS POSITION===================================//

// Route to update a client's location
app.put('/update-client/:id', (req, res) => {
  const { id } = req.params; // Get client ID from the URL
  const { latitude, longitude } = req.body; // Get updated coordinates

  const query = "UPDATE client_tbl SET latitude = ?, longitude = ? WHERE id = ?";
  db.query(query, [latitude, longitude, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json({ message: "Client updated successfully" });
  });
});


//===============================VIEW WORKER TABLE ADMIN SIDE===================================//

app.get("/admin/workers", async (req, res) => {
  const query = "SELECT * FROM user_tbl WHERE role = 'worker'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching workers:", err);
      res.status(500).json({ error: "Database query failed" });
    } else {
      res.json(results);
    }
  });
});
//================================VIEW MAP ADIN SIDE===================================//

// Endpoint to fetch active client data
app.get("/clients-admin-map", (req, res) => {
  const query = `
    SELECT 
      id, 
      category_name, 
      fname AS full_name, 
      latitude, 
      longitude, 
      worker_id 
    FROM 
      client_tbl 
    WHERE 
      status = 'Active'
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching clients:", err);
      res.status(500).send("Error fetching clients");
    } else {
      res.json(results);
    }
  });
});

// Corrected endpoint to fetch high-risk place_assign areas with optional category filter
app.get('/clients-admin-map-high-risk', (req, res) => {
  const { category_name } = req.query;

  // Base SQL query with status condition
  let query = `
    SELECT 
      u.place_assign,
      c.category_name,
      COUNT(*) AS category_count,
      u.id AS worker_id,
      u.first_name AS worker_name
    FROM 
      client_tbl c
    JOIN 
      user_tbl u ON c.worker_id = u.id
    WHERE 
      c.status = 'Active'
  `;

  const queryParams = [];

  // Append category filter if category_name is provided
  if (category_name) {
    query += ` AND c.category_name = ?`;
    queryParams.push(category_name);
  }

  // Append GROUP BY and HAVING clauses
  query += `
    GROUP BY 
      u.place_assign, c.category_name, u.id, u.first_name
    HAVING 
      COUNT(*) > 5
  `;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching high-risk place_assign areas:", err);
      res.status(500).send("Error fetching high-risk place_assign areas");
    } else {
      res.json(results);
    }
  });
});
//================================UPDATE STATUS===================================//

// Fetch clients
app.put('/clients/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE client_tbl SET status = ? WHERE id = ?', [status, id]);
    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

//===============================UPDATE CLIENTS===================================//

// Server code to update client information
app.post('/update-client', async (req, res) => {
  const { id, fname, category_name, address, phone_no, phil_id, gender, birthdate } = req.body;

  // Calculate age from birthdate
  const birthDateObj = new Date(birthdate);
  let age = new Date().getFullYear() - birthDateObj.getFullYear();
  const monthDifference = new Date().getMonth() - birthDateObj.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && new Date().getDate() < birthDateObj.getDate())) {
    age--;
  }

  try {
    await db.query(
      `UPDATE client_tbl SET fname = ?, category_name = ?, address = ?, phone_no = ?, phil_id = ?, gender = ?, birthdate = ?, age = ? WHERE id = ?`,
      [fname, category_name, address, phone_no, phil_id, gender, birthdate, age, id],
      (error, result) => {
        if (error) {
          console.error("Error updating client:", error);
          return res.status(500).send({ error: 'Failed to update client information' });
        }
        res.send({ message: 'Client updated successfully' });
      }
    );
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).send({ error: 'Failed to update client information' });
  }
});


//================================VIEW CLIENTS===================================//
app.get('/clients', (req, res) => {
  const workerId = req.query.workerId; // Get workerId from the query
  const status = req.query.status || 'Active'; // Retrieve status if provided, default to 'Active'

  let query = "SELECT * FROM client_tbl WHERE worker_id = ? AND status = ?";
  const queryParams = [workerId, status];

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json(results);
  });
});

// Update Client Status Endpoint
app.put('/clients/:id/status', (req, res) => {
  const clientId = req.params.id;
  const { status } = req.body;

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  let query = "UPDATE client_tbl SET status = ? WHERE id = ?";
  const queryParams = [status, clientId];

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({ message: "Client status updated successfully" });
  });
});



//================================VIEW CLIENTS MAP ===================================//
app.get('/clients-map', (req, res) => {
  const workerId = req.query.workerId; // Get workerId from the query
  const clientId = req.query.id; // Get clientId from the query

  let query = "SELECT * FROM client_tbl WHERE worker_id = ? AND id = ?";
  const queryParams = [workerId, clientId]; // Pass both workerId and clientId to query

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    return res.status(200).json(results);
  });
});


//================================MEDICATION TABLE===================================//

const categoryRoutes = {
  'pregnant': 'pregnant',
  'person-with-disabilities': 'person with disabilities',
  'wra-family-planning': 'Family Planning',
  'hypertensive': 'Hypertensive And Type 2 Diabetes',
  '0-59months-old': '0-59 Months Old Children',
  'senior-cetizen': 'Senior Citizen',
  'filariasis': 'Filariasis Program Services',
  '5-9yearsold': '5-9 years Old Children (School Aged Children)',
  '0-11monthsold': '0-11 Months Old Infants',
  'schistosomiasis': 'Schistomiasis Program Services',
  'currentsmokers': 'Current Smokers',
  '0-59yearsold': '0-59 years Old Screened For Visual Activity',
  '10-19yo' : '10-19 Years Old (Adolescents)',
};

// Helper function to validate worker_id (assuming it's numeric)
const isValidWorkerId = (id) => {
  return /^\d+$/.test(id);
};

// Dynamic route to handle all categories
app.get('/:category/clients', (req, res) => {
  const { category } = req.params;
  const { worker_id } = req.query;

  // Validate presence of worker_id
  if (!worker_id) {
    return res.status(400).json({ error: 'worker_id is required' });
  }

  // Validate format of worker_id
  if (!isValidWorkerId(worker_id)) {
    return res.status(400).json({ error: 'Invalid worker_id format. It should be numeric.' });
  }

  // Retrieve the corresponding category name
  const categoryKey = category.toLowerCase();
  const categoryName = categoryRoutes[categoryKey];

  // Validate category
  if (!categoryName) {
    return res.status(400).json({ error: 'Invalid category. Please check the URL parameter.' });
  }

  // Construct the SQL query with status condition
  const query = `
    SELECT * 
    FROM client_tbl 
    WHERE worker_id = ? 
      AND category_name = ?
      AND status = 'Active'
  `;

  // Execute the query using parameterized inputs to prevent SQL injection
  db.query(query, [worker_id, categoryName], (err, results) => {
    if (err) {
      console.error(`Error fetching ${categoryName} clients:`, err);
      return res.status(500).json({ error: `Failed to fetch ${categoryName} clients` });
    }

    // Return the results as JSON
    res.json(results);
  });
});

// Centralized Error Handling Middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});
//-------------------------MESSAGE ADMIN TO WORKER-------------//

app.get("/getWorkers", (req, res) => {
  db.query("SELECT id, first_name, last_name FROM user_tbl WHERE role = 'worker'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get messages endpoint
app.get("/getMessages", (req, res) => {
  db.query("SELECT * FROM messages_tbl ORDER BY timestamp DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Send message endpoint
app.post("/sendMessageToWorkers", (req, res) => {
  const { message, sender_id, recipients } = req.body;
  if (!message || !sender_id || !recipients || !Array.isArray(recipients)) {
    return res.status(400).json({ error: "Message, sender_id, and recipients are required" });
  }

  const timestamp = new Date();

  // Loop through each recipient and send the message
  recipients.forEach((receiver_id) => {
    db.query(
      "INSERT INTO messages_tbl (message, sender_id, receiver_id, timestamp, is_read) VALUES (?, ?, ?, ?, ?)",
      [message, sender_id, receiver_id, timestamp, false], // setting `is_read` to false
      (err) => {
        if (err) {
          console.error(`Failed to send message to recipient ${receiver_id}:`, err.message);
        } else {
          // Emit the message specifically to the recipient
          io.to(`worker_${receiver_id}`).emit("newAnnouncement", { message, sender_id, timestamp });
        }
      }
    );
  });

  res.status(200).json({ message: "Message sent to recipients successfully!" });
});

// Socket.IO connection event
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  // Handle the worker joining a room based on their ID
  socket.on("joinWorkerRoom", (workerId) => {
    socket.join(`worker_${workerId}`);
    console.log(`Worker ${workerId} joined room worker_${workerId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});


app.get('/getMessagesworker', (req, res) => {
    const { receiver_id } = req.query;

    // Check if receiver_id is provided
    if (!receiver_id) {
        return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Construct the SQL query directly using receiver_id
    const query = `SELECT * FROM messages_tbl WHERE receiver_id = ${receiver_id}`;

    // Execute the query
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // Send the fetched messages as a response
        res.json(results);
    });
});

app.get('/getUnreadMessagesCount', (req, res) => {
    const receiverId = req.query.receiver_id; // Get receiver_id from query

    // Check if receiver_id is provided
    if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Construct the SQL query to count unread messages
    const query = `SELECT COUNT(*) AS count FROM messages_tbl WHERE receiver_id = ? AND is_read = 0`;

    db.query(query, [receiverId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        // Send the count of unread messages as a response
        res.status(200).json({ count: results[0].count });
    });
});


app.post("/updateMessagesToRead", async (req, res) => {
  const { receiver_id } = req.body;
  try {
    await db.query(`UPDATE messages_tbl SET is_read = 1 WHERE receiver_id = ? AND is_read = 0`, [receiver_id]);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ error: "Failed to update messages" });
  }
});




//-------------------------ATTENDANCE-------------------------//

app.get('/get-attendance-logs', (req, res) => {
  const { userId } = req.query;
  
  db.query(
    `SELECT date, status, time_in, time_out FROM attendance_logs WHERE user_id = ?`,
    [userId],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Database error.' });
      }
      
      res.json(results || []); // Ensures an array response
    }
  );
});


app.post('/log-attendance', (req, res) => {
  const { userId, date, timeIn, timeOut } = req.body;

  db.query(
    `SELECT * FROM attendance_logs WHERE user_id = ? AND date = ?`,
    [userId, date],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Database error.' });
      }

      if (results.length > 0) {
        // Record exists, update Time Out
        db.query(
          `UPDATE attendance_logs SET time_out = ? WHERE user_id = ? AND date = ?`,
          [timeOut, userId, date],
          (updateError) => {
            if (updateError) {
              console.error(updateError);
              return res.status(500).json({ message: 'Error updating log.' });
            }
            res.json({ message: 'Time Out recorded successfully.' });
          }
        );
      } else {
        // No record, insert Time In
        db.query(
          `INSERT INTO attendance_logs (user_id, date, time_in, status) VALUES (?, ?, ?, 'present')`,
          [userId, date, timeIn],
          (insertError) => {
            if (insertError) {
              console.error(insertError);
              return res.status(500).json({ message: 'Error recording Time In.' });
            }
            res.json({ message: 'Time In recorded successfully.' });
          }
        );
      }
    }
  );
});

//-------------------------10 TO 18 YEARS OLD VIEW TABLE-------------------------//


//============================ONLINE ADD CLIENTS================================//

app.get('/pending-clients', (req, res) => {
  const workerId = req.query.workerId;

  if (!workerId) {
    return res.status(400).json({ error: "workerId query parameter is required" });
  }

  const sql = "SELECT id, fname, address, phone_no, phil_id, date_registered, category_name, latitude, longitude FROM client_tbl WHERE worker_id = ? AND status = 'Pending'";

  db.query(sql, [workerId], (err, results) => {
    if (err) {
      console.error('Database error fetching pending clients:', err);
      return res.status(500).json({ error: "Database error fetching pending clients" });
    }
    res.json(results);
  });
});

// New Endpoint: Update Client Status to Active
app.put('/clients/:id/status', (req, res) => {
  const clientId = req.params.id;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive', 'Pending'].includes(status)) {
    return res.status(400).json({ error: "Invalid or missing status in request body" });
  }

  const sql = "UPDATE client_tbl SET status = ? WHERE id = ?";

  db.query(sql, [status, clientId], (err, result) => {
    if (err) {
      console.error('Database error updating client status:', err);
      return res.status(500).json({ error: "Database error updating client status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({ message: "Client status updated successfully" });
  });
});

app.get('/get-active-workers', (req, res) => {
  const sql = "SELECT id, first_name, last_name FROM user_tbl WHERE status = 'Active'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ workers: results });
  });
});

// Function to insert client within a transaction
const insertClient = (clientData, callback) => {
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction error:', err);
      return callback(err);
    }

    const sql = `
      INSERT INTO client_tbl 
      (category_name, fname, address, phone_no, phil_id, gender, latitude, longitude, date_registered, status, worker_id, birthdate, age)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Pending', ?, ?, ?)
    `;

    db.query(sql, [
      clientData.category_name,
      clientData.fname,
      clientData.address,
      clientData.phone_no || '',
      clientData.phil_id || '',
      clientData.gender,
      clientData.latitude,
      clientData.longitude,
      clientData.worker_id,
      clientData.birthdate,
      clientData.age
    ], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Database error during client insertion:', err);
          callback(err);
        });
      }

      const insertId = result.insertId;
      console.log('Client added successfully:', insertId);

      // Commit the transaction
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Commit error:', err);
            callback(err);
          });
        }
        callback(null, insertId);
      });
    });
  });
};

// Endpoint to add a new client
app.post('/online-add-client', async (req, res) => {
  const {
    category_name,
    fname,
    address,
    phone_no,
    phil_id,
    gender,
    worker_id,
    birthdate
  } = req.body;

  console.log('Received data:', {
    category_name,
    fname,
    address,
    phone_no,
    phil_id,
    gender,
    worker_id,
    birthdate
  });

  // Validate required fields
  if (!fname || !address || !category_name || !worker_id || !gender || !birthdate) {
    console.error('Missing required fields:', { fname, address, category_name, worker_id, gender, birthdate });
    return res.status(400).json({ error: "Full name, address, category, gender, worker ID, and birthdate are required" });
  }

  // Calculate age from birthdate
  const birthDateObj = new Date(birthdate);
  let age = new Date().getFullYear() - birthDateObj.getFullYear();
  const monthDifference = new Date().getMonth() - birthDateObj.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && new Date().getDate() < birthDateObj.getDate())) {
    age--;
  }

  try {
    // Verify that the worker_id exists and is active
    const workerCheckSql = "SELECT * FROM user_tbl WHERE id = ? AND status = 'Active'";
    db.query(workerCheckSql, [worker_id], (workerErr, workerResults) => {
      if (workerErr) {
        console.error('Database error during worker verification:', workerErr);
        return res.status(500).json({ error: "Database error during worker verification" });
      }

      if (workerResults.length === 0) {
        console.error('Invalid or inactive worker_id:', worker_id);
        return res.status(400).json({ error: "Invalid or inactive worker ID" });
      }

      console.log('Worker ID is valid and active.');

      // Proceed with geocoding and insertion
      geocodeAndInsertClient();
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: "Failed to add client" });
  }

  // Function to geocode and insert client
  const geocodeAndInsertClient = async () => {
    try {
      console.log('Geocoding address...');
      // Geocode the address using ArcGIS API
      const geoResponse = await axios.get(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates`, {
        params: {
          f: 'json',
          SingleLine: address,
          outFields: 'Match_addr,Addr_type'
        }
      });

      const candidates = geoResponse.data.candidates;
      if (candidates.length === 0) {
        console.error('Unable to geocode address:', address);
        return res.status(400).json({ error: "Unable to geocode address" });
      }

      // Get latitude and longitude from the first candidate
      const { y: latitude, x: longitude } = candidates[0].location;
      console.log(`Geocoded address: Latitude=${latitude}, Longitude=${longitude}`);

      // Prepare client data
      const clientData = {
        category_name,
        fname,
        address,
        phone_no,
        phil_id,
        gender,
        latitude,
        longitude,
        worker_id,
        birthdate,
        age
      };

      // Insert client into the database within a transaction
      insertClient(clientData, (err, insertId) => {
        if (err) {
          return res.status(500).json({ error: "Failed to add client" });
        }

        // Verify insertion by selecting the newly inserted client
        const verifySql = "SELECT * FROM client_tbl WHERE id = ?";
        db.query(verifySql, [insertId], (verifyErr, verifyResults) => {
          if (verifyErr) {
            console.error('Error verifying client insertion:', verifyErr);
            return res.status(500).json({ error: "Error verifying client insertion" });
          }
          if (verifyResults.length > 0) {
            console.log('Client verification:', verifyResults[0]);
          } else {
            console.error('Client not found after insertion.');
            return res.status(500).json({ error: "Client verification failed" });
          }
          return res.json({ message: "Client added successfully", clientId: insertId });
        });
      });

    } catch (error) {
      console.error('Error during the geocoding or database operation:', error);
      return res.status(500).json({ error: "Failed to add client" });
    }
  };
});

//=============================CHECK DUPLICATES CLIENTS===============================//

// Server-side duplicate check endpoint
app.post('/check-duplicate', (req, res) => {
  const { fname, phil_id } = req.body;

  if (!fname || !phil_id) {
    return res.status(400).json({ error: "First name and PhilHealth ID are required for duplicate check." });
  }

  const sql = `
    SELECT 1 FROM client_tbl 
    WHERE fname = ? AND phil_id = ?
    LIMIT 1
  `;

  db.query(sql, [fname, phil_id], (err, results) => {
    if (err) {
      console.error('Database error during duplicate check:', err);
      return res.status(500).json({ error: "Database error during duplicate check" });
    }

    if (results.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  });
});


//================================ADD CLIENTS===================================//

const axios = require('axios');

// Route to add a client
app.post('/add-client', async (req, res) => {
  const {
    category_name,
    fname,
    address,
    phone_no,
    phil_id,
    gender,
    worker_id,
    birthdate
  } = req.body;

  // Log the data to verify that all fields are correctly received
  console.log('Received data:', {
    category_name,
    fname,
    address,
    phone_no,
    phil_id,
    gender,
    worker_id,
    birthdate
  });

  // Validate required fields
  if (!fname || !address || !category_name || !worker_id || !gender || !birthdate) {
    console.error('Missing required fields:', { fname, address, category_name, worker_id, gender, birthdate });
    return res.status(400).json({ error: "Full name, address, category, gender, worker ID, and birthdate are required" });
  }

  // Calculate age from birthdate
  const birthDateObj = new Date(birthdate);
  let age = new Date().getFullYear() - birthDateObj.getFullYear();
  const monthDifference = new Date().getMonth() - birthDateObj.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && new Date().getDate() < birthDateObj.getDate())) {
    age--;
  }

  try {
    // **Duplicate Detection**
    let duplicateCheckSql = `
      SELECT * FROM client_tbl 
      WHERE fname = ? AND phil_id = ?
      LIMIT 1
    `;
    db.query(duplicateCheckSql, [fname, phil_id], (err, results) => {
      if (err) {
        console.error('Database error during duplicate check:', err);
        return res.status(500).json({ error: "Database error during duplicate check" });
      }

      if (results.length > 0) {
        console.warn('Duplicate client detected:', results[0]);
        return res.status(400).json({ error: "A client with the same name and PhilHealth ID already exists." });
      }

      // **Geocode the address using ArcGIS API**
      axios.get(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates`, {
        params: {
          f: 'json',
          SingleLine: address,
          outFields: 'Match_addr,Addr_type'
        }
      })
      .then(geoResponse => {
        const candidates = geoResponse.data.candidates;
        if (candidates.length === 0) {
          console.error('Unable to geocode address:', address);
          return res.status(400).json({ error: "Unable to geocode address" });
        }

        // Get latitude and longitude from the first candidate
        const { y: latitude, x: longitude } = candidates[0].location;

        // **Insert client into the database**
        const insertSql = `
          INSERT INTO client_tbl 
          (category_name, fname, address, phone_no, phil_id, gender, latitude, longitude, date_registered, status, worker_id, birthdate, age)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Active', ?, ?, ?)
        `;

        db.query(insertSql, [
          category_name,
          fname,
          address,
          phone_no || '',
          phil_id || '',
          gender,
          latitude,
          longitude,
          worker_id,
          birthdate,
          age
        ], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Database error during client insertion:', insertErr);
            return res.status(500).json({ error: "Database error during client insertion" });
          }

          console.log('Client added successfully:', insertResult.insertId);
          return res.json({ message: "Client added successfully", clientId: insertResult.insertId });
        });
      })
      .catch(geoError => {
        console.error('Error during geocoding:', geoError);
        return res.status(500).json({ error: "Failed to geocode address" });
      });
    });

  } catch (error) {
    console.error('Error during the duplicate check or database operation:', error);
    return res.status(500).json({ error: "Failed to add client" });
  }
});

///================================UPDATE WORKER===================================//

app.put(
  "/update-worker/:id",
  upload.fields([
    { name: "id_pic", maxCount: 1 },
    { name: "profile_pic", maxCount: 1 },
  ]),
  (req, res) => {
    const workerId = req.params.id;
    let {
      firstName,
      lastName,
      age,
      address,
      gender,
      birthdate,
      placeAssigned,
      username,
    } = req.body;

    // Convert birthdate to "YYYY-MM-DD"
    if (birthdate) {
      const dateObj = new Date(birthdate);
      birthdate = dateObj.toISOString().split("T")[0];
    }

    // Now birthdate is e.g. "2003-01-01"

    const idPic = req.files?.id_pic ? req.files.id_pic[0].filename : null;
    const profilePic = req.files?.profile_pic
      ? req.files.profile_pic[0].filename
      : null;

    const selectQuery = "SELECT id_pic, profile_pic FROM user_tbl WHERE id = ?";
    db.query(selectQuery, [workerId], (selectErr, selectResult) => {
      if (selectErr) {
        console.error("Error fetching existing data:", selectErr);
        return res.status(500).json({ error: "Database fetch failed" });
      }

      const existingData = selectResult[0] || {};

      const updateQuery = `
        UPDATE user_tbl
          SET
            first_name = ?,
            last_name = ?,
            age = ?,
            address = ?,
            gender = ?,
            birth_date = ?,
            place_assign = ?,
            username = ?,
            id_pic = ?,
            profile_pic = ?
          WHERE id = ?
      `;

      const updateValues = [
        firstName,
        lastName,
        age,
        address,
        gender,
        birthdate,
        placeAssigned,
        username,
        idPic || existingData.id_pic,
        profilePic || existingData.profile_pic,
        workerId,
      ];

      db.query(updateQuery, updateValues, (updateErr) => {
        if (updateErr) {
          console.error("Database error:", updateErr);
          return res.status(500).json({ error: "Database update failed" });
        }
        return res.status(200).json({ message: "Worker updated successfully" });
      });
    });
  }
);

//==============================DEACTIVATE WORKER===================================//

app.put("/admin/workers/:id", async (req, res) => {
  const workerId = req.params.id;
  const { status } = req.body;

  try {
    const query = "UPDATE user_tbl SET status = ? WHERE id = ?";
    await db.query(query, [status, workerId]);

    res.status(200).json({ message: "Worker status updated successfully." });
  } catch (error) {
    console.error("Error updating worker status:", error);
    res.status(500).json({ message: "Failed to update worker status." });
  }
});



//================================UPDATE ACCOUNT ===================================//


app.post('/validate-admin', async (req, res) => {
  const { adminPassword, sessionRole } = req.body;

  try {
    // Query to check the role and password of the user
    const queryResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT role FROM user_tbl WHERE password = ?",
        [adminPassword],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    console.log("Query Result:", queryResult); // Debugging log

    if (queryResult.length === 0) {
      return res.status(404).json({
        isValid: false,
        message: "Password not found.",
      });
    }

    const receivedRole = queryResult[0]?.role;
    console.log("Received Role:", receivedRole); // Debugging log

    if (receivedRole && receivedRole === 'admin' && sessionRole === 'admin') {
      return res.status(200).json({ isValid: true });
    } else {
      return res.status(401).json({
        isValid: false,
        message: "Invalid admin credentials.",
      });
    }
  } catch (error) {
    console.error("Error validating admin:", error);
    return res.status(500).json({
      isValid: false,
      message: "Server error. Please try again later.",
    });
  }
});


// API Endpoint: Update User
app.put('/update-user/:id', async (req, res) => {
  const { id } = req.params; // Getting the user ID from the URL parameter
  const { username, password } = req.body; // Destructuring username and password from the body

  try {
    // Performing the update query
    await db.query(
      `UPDATE user_tbl SET username = ?, password = ? WHERE id = ?`,
      [username, password, id] // Passing values as parameters to prevent SQL injection
    );

    // Sending success response
    res.send({ message: 'User updated successfully' });
  } catch (error) {
    // Logging the error for debugging
    console.error("Error updating user:", error);

    // Sending error response
    res.status(500).send({ error: 'Failed to update user information' });
  }
});





//================================ADD WORKER===================================//

// Set up file storage for images using multer

// Worker upload route
app.post('/upload-worker', upload.fields([{ name: 'id_pic' }, { name: 'profile_pic' }]), (req, res) => {
  const { first_name, last_name, birth_date, age, gender, address, place_assign, username, password } = req.body;
  const idPicPath = req.files['id_pic'] ? req.files['id_pic'][0].filename : '';
  const profilePicPath = req.files['profile_pic'] ? req.files['profile_pic'][0].filename : '';

  const query = "INSERT INTO user_tbl (first_name, last_name, birth_date, age, gender, address, place_assign, username, password, id_pic, profile_pic, date_of_reg, status, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Active', 'worker')";
  db.query(query, [first_name, last_name, birth_date, age, gender, address, place_assign, username, password, idPicPath, profilePicPath], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error inserting data", error: err });
    }
    return res.status(201).json({ message: "Worker registered successfully", data: results });
  });
});

//=======================SMS HANDLE ACOUNT===============================//

app.post('/sendSmsAnnouncement', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Missing phone number or message.' });
  }

  try {
    // Send SMS via Semaphore API
    const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
      apikey: 'f5657a354d9943879c8ac1762b058b35', // Replace with your actual Semaphore API key
      number,
      message,
      sendername: 'MalagosHC' // Replace with your registered sender name
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // If the SMS was sent successfully, insert the message into the database
    const insertQuery = "INSERT INTO handleaccountsms_tbl (phone_number, message, date_send) VALUES (?, ?, NOW())";
    db.query(insertQuery, [number, message], (err, results) => {
      if (err) {
        console.error('Error inserting message into database:', err);
        return res.status(500).json({ error: 'Failed to store message in the database.', details: err });
      }
      db.query('SELECT * FROM handleaccountsms_tbl ORDER BY date_send DESC', (err, messages) => {
        if (err) {
          console.error('Error fetching messages from database:', err);
          return res.status(500).json({ error: 'Failed to fetch messages from the database.', details: err });
        }
        return res.status(200).json({ message: 'SMS sent and stored successfully!', data: response.data, messages });
      });
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error.response) {
      return res.status(500).json({ error: 'Failed to send SMS', details: error.response.data });
    } else {
      return res.status(500).json({ error: 'No response from Semaphore' });
    }
  }
});

app.get('/getSmsMessages', (req, res) => {
    const query = 'SELECT * FROM handleaccountsms_tbl ORDER BY date_send DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching SMS messages:', err);
            return res.status(500).json({ error: 'Failed to fetch SMS messages.', details: err });
        }
        res.status(200).json(results);
    });
});

//========================HANDLE ACCOUNT===================================//

app.post('/help-request', (req, res) => {
  const { fullName, address, placeAssign, phoneNumber, loginIssue } = req.body;

  const query = `INSERT INTO handleaccount_tbl (full_name, address, place_assign, phone_number, login_issue, is_read)
                 VALUES (?, ?, ?, ?, ?, false)`;

  db.query(query, [fullName, address, placeAssign, phoneNumber, loginIssue], (err, result) => {
    if (err) {
      console.error('Error inserting help request:', err);
      return res.status(500).send('Failed to submit help request.');
    }
    res.status(200).send('Help request submitted successfully.');
  });
});

// Endpoint to get unread notifications count for admin
app.get('/getUnreadHelpRequests', (req, res) => {
  const query = `SELECT COUNT(*) AS count FROM handleaccount_tbl WHERE is_read = false`;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching unread help requests:', err);
      return res.status(500).send('Failed to fetch unread help requests.');
    }
    res.status(200).json({ count: result[0].count });
  });
});

// Endpoint to get all help requests for the admin
app.get('/getAllHelpRequests', (req, res) => {
  const query = `SELECT * FROM handleaccount_tbl ORDER BY id DESC`;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching help requests:', err);
      return res.status(500).send('Failed to fetch help requests.');
    }
    res.status(200).json(result);
  });
});

// Endpoint to mark help requests as read
app.put('/markHelpRequestsRead', (req, res) => {
  const query = `UPDATE handleaccount_tbl SET is_read = true WHERE is_read = false`;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error marking help requests as read:', err);
      return res.status(500).send('Failed to mark help requests as read.');
    }
    res.status(200).send('Help requests marked as read successfully.');
  });
});


//================================LOGIN===================================//
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Updated SQL query to include place_assign
  const query = `
    SELECT id, first_name, last_name, profile_pic, role, place_assign 
    FROM user_tbl 
    WHERE username = ? 
      AND password = ? 
      AND status = 'Active'
  `;

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length > 0) {
      const { id, first_name, last_name, profile_pic, role, place_assign } = results[0]; // Extract user details including place_assign
      return res.status(200).json({
        success: true,
        id,
        first_name,
        last_name,
        profile_pic,
        role,
        place_assign, // Include place_assign in the response
      });
    } else {
      // Updated error message to reflect status check
      return res.status(401).json({ success: false, message: "Invalid credentials or account is not active." });
    }
  });
});


server.listen(8081, () => {
  console.log("Server running on https://health-center-repo-production.up.railway.app");
});

