const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const csvFilePath = path.join(__dirname, 'Testcase.csv'); // Adjust path if needed
const reportDir = path.join(__dirname, 'playwright-report'); // Default Playwright report directory
const reportFilePath = path.join(reportDir, 'index.html'); // Full path to the report file

// --- Email Configuration ---
const emailConfig = {
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail' (if using service)
    host: process.env.EMAIL_HOST,       // e.g., 'smtp.office365.com' (if using host/port)
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined, // e.g., 587 or 465
    secure: process.env.EMAIL_SECURE ? (process.env.EMAIL_SECURE === 'true') : undefined, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail if 2FA is enabled
    },
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO, // Comma-separated list of recipients
};

// --- Helper Function to Send Email ---
async function sendReportEmail(status) {
    if (!emailConfig.auth.user || !emailConfig.auth.pass || !emailConfig.to) {
        console.warn('⚠️ Email configuration incomplete. Skipping email notification.');
        return;
    }

    // Check if report file exists before attempting to send
    if (!fs.existsSync(reportFilePath)) {
        console.error(`❌ Report file not found at ${reportFilePath}. Cannot send email attachment.`);
        // Optionally send an email without attachment indicating the report is missing
        // Or just return here if attachment is mandatory
        return;
    }

    console.log(`\n📧 Preparing to send ${status} report email...`);

    // Create transporter object
    let transporterOptions = {};
    if (emailConfig.service) {
        transporterOptions.service = emailConfig.service;
        transporterOptions.auth = emailConfig.auth;
    } else if (emailConfig.host && emailConfig.port) {
        transporterOptions.host = emailConfig.host;
        transporterOptions.port = emailConfig.port;
        transporterOptions.secure = emailConfig.secure;
        transporterOptions.auth = emailConfig.auth;
    } else {
        console.error('❌ Invalid email transport configuration (missing service or host/port).');
        return;
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    // Email options
    const mailOptions = {
        from: emailConfig.from,
        to: emailConfig.to,
        subject: `ROKER TEST REPORT - ${status} - ${new Date().toLocaleString()}`,
        text: `Playwright Roker test execution finished with status: ${status}.\nPlease find the attached HTML report.`, // Added path to text body
        html: `<p>Playwright test execution finished with status: <b>${status}</b>.</p><p>Please find the attached HTML report.</p><p>DOWNLOAD AND VIEW THE HTML REPORT.</P>`, // Added path to HTML body
        attachments: [
            {
                filename: 'ROKER_Regression_Test-report.html', // Name for the attachment
                path: reportFilePath,
                contentType: 'text/html'
            },
        ],
    };

    // Send mail
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}


// --- Main Script Logic ---
(async () => { // Wrap in an async IIFE to use await for email sending
    try {
        // Read the CSV file
        const csvData = fs.readFileSync(csvFilePath, 'utf8');
        const lines = csvData.split('\n');
        const headerLine = lines[0].trim();
        const headers = headerLine.split(',');

        // Find the index of 'Control' and 'TestCaseID' columns
        const controlIndex = headers.indexOf('Control');
        const testCaseIdIndex = headers.indexOf('TestCaseID');

        if (controlIndex === -1 || testCaseIdIndex === -1) {
            throw new Error(`CSV file "${csvFilePath}" must contain 'Control' and 'TestCaseID' columns.`);
        }

        // Find TestCaseIDs where Control is 'Y'
        const testCaseIDsToRun = lines
            .slice(1) // Skip header row
            .map(line => line.trim())
            .filter(line => line) // Remove empty lines
            .map(line => {
                const columns = line.split(','); // Simple CSV split
                return { control: columns[controlIndex]?.trim(), id: columns[testCaseIdIndex]?.trim() };
            })
            .filter(testCase => testCase.control && testCase.control.toUpperCase() === 'Y' && testCase.id)
            .map(testCase => testCase.id);

        if (testCaseIDsToRun.length === 0) {
            console.log(`No test cases marked with Control="Y" found in ${csvFilePath}`);
            process.exit(0); // Exit gracefully if no tests are selected
        }

        console.log('▶️ Test Cases to run:', testCaseIDsToRun.join(', '));

        // Construct the Playwright command with --grep
        const grepPattern = testCaseIDsToRun.join('|'); // Join IDs with OR operator for grep
        // Ensure the reporter is explicitly set to html
        const playwrightCommand = `npx playwright test --reporter=html --grep="${grepPattern}"`;

        console.log(`\n🚀 Executing command: ${playwrightCommand}\n`);

        // Execute the command
        let executionStatus = 'SUCCESS';
        try {
            // Clear previous report if desired (optional)
            // if (fs.existsSync(reportDir)) {
            //     fs.rmSync(reportDir, { recursive: true, force: true });
            //     console.log('🧹 Cleared previous report directory.');
            // }
            execSync(playwrightCommand, { stdio: 'inherit' }); // Inherit stdio to see Playwright output
            console.log('\n✅ Playwright tests completed successfully.');
        } catch (error) {
            console.error('\n❌ Playwright tests failed.');
            executionStatus = 'FAILURE';
            // Don't exit yet, proceed to report path logging and email sending
        }

        // --- Print the report path to the terminal ---
        if (fs.existsSync(reportFilePath)) {
            console.log(`\n📄 HTML Report generated at: ${reportFilePath}`);
            // You can also provide a file URL for easier opening on some systems:
            // console.log(`   File URL: file://${reportFilePath}`);
        } else {
            // This might happen if Playwright failed very early or config is wrong
            console.warn(`\n⚠️ HTML Report file not found at: ${reportFilePath}. Cannot provide path or send attachment.`);
        }
        // --- End of printing path ---

        // Send email after execution attempt
        await sendReportEmail(executionStatus); // Use await as sendReportEmail is async

        // Exit with appropriate code if tests failed
        if (executionStatus === 'FAILURE') {
            process.exit(1); // Indicate failure
        }

    } catch (error) {
        console.error('\n❌ An error occurred in the main script execution:', error);
        // Optionally send a failure notification email here too if the script itself crashes
        // await sendFailureNotificationEmail(error); // Implement if needed
        process.exit(1); // Exit with a failure code
    }
})(); // Immediately invoke the async function
