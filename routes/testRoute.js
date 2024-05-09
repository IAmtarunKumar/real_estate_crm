const express = require("express")
const router = express.Router()

router.get("/" , async(req,res)=>{
    return res.status(200).send("test is working")
})




const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const puppeteer = require('puppeteer'); // Import Puppeteer
const mammoth = require("mammoth")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const pdfData = "PDF_DATA/";
if (!fs.existsSync(pdfData)) {
  fs.mkdirSync(pdfData, { recursive: true });
}
router.post('/pdf', upload.fields([{ name: 'excel' },{ name : "docx" }]), async (req, res) => {

    console.log("convert pdf api is calling")
    // console.log("req.file" , req.file)
    console.log("req.files" , req.files)
    const excelFile = req.files['excel'][0]
    const docxFile = req.files['docx'][0];

    console.log("excel" , req.files['excel'][0])
    console.log("docx" , req.files['docx'][0])

    // return

  let i = 1
  const { folderName, rootFolder , userEmail, fileName } = req.body;

  console.log("genrate docs req.body" , req.body)

//make word data excel
//   const file = bucket.file(`word docx/${fileName}`);
//   const [buffer] = await file.download();

  /// not crete dublicate foler
 
  const fss = require('fs').promises;
  const directoryPath = path.join(`${pdfData}/${rootFolder}/`);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  console.log("directory path" ,directoryPath )

    const files = await fss.readdir(directoryPath, { withFileTypes: true });
    const directories = files.filter(file => file.isDirectory()).map(dir => dir.name);

    console.log("directories"  , directories )

    for (let data of directories) {
      if (data === folderName) {
        return res.status(400).send("Folder already exist!")
      } 
    }
  ///




  console.log("genrate docx api calling", req.body);
  res.status(200).send('Files processed successfully');

  const rootFolderPath = path.join(`${pdfData}/${rootFolder}/`, folderName);
  console.log("Folder path:", rootFolderPath);

  if (!fs.existsSync(rootFolderPath)) {
    fs.mkdirSync(rootFolderPath, { recursive: true });
  }

//   console.log("req.files data" . req.files['excel'][0])

  try {
    // const excelFile = req.files['excel'][0];
    // const docxFile = req.files['docx'][0];
    // const docxFile = buffer

    console.log("docx file buffer" , docxFile)
    const workbook = XLSX.read(excelFile.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    const excelDatalength = XLSX.utils.sheet_to_json(sheet, {header:1});

    console.log("excel data length out loop", excelDatalength.length)


    // const result = await Utility.deleteMany({});
    // let saveUtility = new Utility({
    //   totalData: excelDatalength.length,
    //   progress: i,
    //   unique: "progress",
    //   userEmail: userEmail

    // });
    // await saveUtility.save()


    for (let index = 0; index < excelData.length; index++) {
      //update progress bar

      console.log("excelData length....", excelDatalength.length)
    //   let foundUtility = await Utility.findOne({ userEmail })
    //   if (foundUtility) {
    //     let abc = await Utility.findOneAndUpdate({ userEmail }, { progress: ++i, userEmail: userEmail })
    //     console.log("updated successfully utility", abc)
    //   } else {
    //     console.log("utility userEmail not found")
    //   }
      //


      const row = excelData[index];
      const docxBuffer = docxFile.buffer;
      const doc = new Docxtemplater(new PizZip(docxBuffer));
      // Populate the template
      function excelDateToJSDate(serial) {
        var excelStartDate = new Date(Date.UTC(1899, 11, 30)); // Set the start date
        var actualDate = new Date(excelStartDate.getTime() + serial * 86400000); // Convert serial to milliseconds
        return actualDate.toISOString().substring(0, 10); // Return date in YYYY-MM-DD format
      }

      const formattedNoticeDate = excelDateToJSDate(row['notice date']);
      const formattedNPADate = excelDateToJSDate(row['NPA DATE']);
      const formattedCLAIM_AMOUNT_AS_ONDate = excelDateToJSDate(row['CLAIM AMOUNT AS ON']);
      const customerFatherHusbandName = row['CUSTOMER FH NAME'] || 'Not Available';

      doc.setData({
        "ed_number": row['ed number'],
        "Notice_date": formattedNoticeDate,
        "lot": row['lot'],
        "file_no": row['file no.'],
        "CUSTOMER_NAME": row['CUSTOMER NAME'],
        "CUSTOMER_NAME2": row['CUSTOMER NAME2'],

        "CUSTOMER FATHER OR HUSBAND NAME": customerFatherHusbandName,
        "CUSTOMER_ADDRESS1_WITH_PIN_CODE": row['CUSTOMER_ADDRESS1_WITH_PIN_CODE'],
        "PRODUCT": row['PRODUCT'],
        "LOAN_ACCOUNT_NO": row['LOAN ACCOUNT NO'],
        "DISBURSEMENT_AMOUNT": row['DISBURSEMENT AMOUNT'],
        "NPA_DATE": formattedNPADate,
        "CLAIM_AMOUNT": row['CLAIM AMOUNT'],
        "amount_in_words": row['amount in words'],
        "CLAIM_AMOUNT_AS_ON": formattedCLAIM_AMOUNT_AS_ONDate,
        "TEST": row['test'],
        "BU_BRANCH_NAME": row['BU/ BRANCH NAME'],
        "REGIONTERRITORY": row['REGION/TERRITORY'],
        "COLLECTION_OFFICER_NAME": row['COLLECTION OFFICER NAME'],
        "COLLECTION_OFFICER_MOBILE_NUMBER": row['COLLECTION OFFICER MOBILE NUMBER']
      });
      console.log("customer name : ", customerFatherHusbandName)
      console.log("customer name 2", row['CUSTOMER NAME2'])

      doc.render();

      const updatedDocxContent = doc.getZip().generate({ type: 'nodebuffer' });

      const pdfBuffer = await convertDocxToPdf(updatedDocxContent, row);
      const outputPath = path.resolve(rootFolderPath, `Updated_Doc_${index + 1}.pdf`);
      fs.writeFileSync(outputPath, pdfBuffer);
    }
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).send('Error processing files');
  }
});

async function convertDocxToPdf(docxBuffer, rowData) {
  // const puppeteer = require('puppeteer');

//   const browser = await puppeteer.launch({
//     args: [
//       '--no-sandbox', // Essential when running as root or in docker without a sandbox
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage', // Overcome limited resource problems
//       '--disable-accelerated-2d-canvas', // Disable hardware acceleration
//       '--no-first-run',
//       '--no-zygote',
//       '--single-process', // Run Chromium in a single process mode
//       '--disable-gpu' // GPU hardware acceleration isn't necessary for PDF generation
//     ],
//     headless: true // Running in headless mode is suitable for server environments
//   });

  const browser = await puppeteer.launch();
//   const page = await browser.newPage();
  const page = await browser.newPage();

  // Generate HTML content from docxBuffer (You might need mammoth here if not done earlier)
  let { value } = await mammoth.convertToHtml({ buffer: docxBuffer });
//   let { value } = await mammoth.convertToHtml({ buffer: docxBuffer });
  // Removing specific unwanted lines
  const unwantedPatterns = [
    "KONCEPT LAW Ambika Mehra",
    "ASSOCIATES \\(Advocate\\)",
    "B\\.Sc\\. LL\\.B"
  ];

  unwantedPatterns.forEach(pattern => {
    // This regex accounts for potential HTML tags and spaces around the words
    let regex = new RegExp(pattern.split(" ").join("\\s*(?:<[^>]+>\\s*)?"), 'gi');
    value = value.replace(regex, '');
  });

  // Correct undefined entries


  // Find the position to insert the signature image
  const signatureHtml = '<p><img src="https://raw.githubusercontent.com/adityagithubraj/pinterest_clone/main/photo/WhatsApp%20Image%202024-04-18%20at%2016.41.00_fdf16bc1.jpg" alt="Signature" style="width: 100px; height: auto;"></p>';
  const closingText = "Yours faithfully,";
  const closingPosition = value.indexOf(closingText);

  // Insert the signature after "Yours faithfully,"
  let enhancedHtml;
  if (closingPosition !== -1) {
    enhancedHtml = value.slice(0, closingPosition + closingText.length) + signatureHtml + value.slice(closingPosition + closingText.length);
  } else {
    enhancedHtml = value + signatureHtml;  // Fallback if the specific text isn't found
  }

  // Center "Loan Recall Notice" and the date
  enhancedHtml = enhancedHtml.replace(/Loan Recall Notice/g, '<center>Loan Recall Notice</center>');
  //enhancedHtml = enhancedHtml.replace(/Date :\s+([0-9]+)/g, (match, p1) => `<center>Date : ${p1}</center>`);

  // Insert your styled HTML here. This is just a placeholder.
  const styledHtml = `
    <style>
    body {
        font-family: 'Times New Roman', serif;
        font-size: 7.5pt;
        color: #333;
        margin: 50px;
        line-height: 1.3;
    }
    h1 {
        color: #000;
        font-size: 18pt;
        text-align: center;
        font-weight: bold;
    }
    table.header-table {
        width: 100%;
        margin-bottom: 20px; /* Space between header and content */
        border-collapse: collapse;
        border: none;
    }
    table.header-table td {
        border: none; /* Remove borders specifically from header cells */
    }
    .header, .header2 {
        font-size: 20pt;
        padding: 0;
        margin: 0;
     
        font-weight: bold;
    }
    .content {
        text-align: justify;
    }
    .ref-details, .address {
        font-size: 10pt;
        margin-left: 0;
        margin-bottom: 15px;
        font-weight: bold;
    }
    .footer {
        font-size: 8pt;
        text-align: center;
        position: fixed;
        bottom: 0;
        width: 100%;
    }
    table, td, th {
        border: 1px solid red;
        font-size: 8pt;
        border-collapse: collapse;
        padding:0
    }
    th{
        border: 1px solid blue;
        font-size: 12pt;
        border-collapse: collapse;
        padding:0
    }
    td{
        border: 1px solid black;
        font-size: 8pt;
        border-collapse: collapse;
        padding:10px
    }
   
    td th{
        margin-top:-100px;
        border: 1px solid red;
    }
    center {
        display: block;
        margin-top: 0;
        margin-bottom: 0;
        text-align: center;
    }

    </style>
    <table class="header-table">
        <tr>
            <td class="header">
                KONCEPT LAW <br> ASSOCIATES
            </td>
            <td class="header2" style="text-align: right;">
             Ambika     Mehra <br> 
                <div style="font-size: 10pt;">(Advocate)</div> 
                <p style="font-size: 8pt;">B.Sc. LL.B</p>
            </td>
        </tr>
    </table>
    ${enhancedHtml}
`;



//   await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
//   const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '5mm', right: '2mm', bottom: '5mm', left: '2mm' } });
try{
await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
const pdfBuffer = await page.pdf({ format: 'A4' });
return pdfBuffer;
} catch (error) {
console.error('Error generating PDF:', error);
throw error;  // Re-throw error to be handled by caller
} finally {
await page.close();
await browser.close();
}




}




//////////////////////////
/////////////////////////



//////////////////////////
/////////////////////////







module.exports = router