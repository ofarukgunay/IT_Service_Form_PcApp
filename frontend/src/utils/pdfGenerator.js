import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementSelector, filename = 'servis_bakim_formu') => {
  try {
    // Hide all print:hidden elements
    const hiddenElements = document.querySelectorAll('.print\\:hidden');
    hiddenElements.forEach(el => el.style.display = 'none');

    // Get the element to convert
    const element = document.querySelector(elementSelector);
    if (!element) {
      throw new Error('Element not found');
    }

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable logging for cleaner output
      allowTaint: true,
      foreignObjectRendering: true
    });

    // Create PDF with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate dimensions to fit A4
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename with current date
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    const finalFilename = `${filename}_${dateString}.pdf`;

    // Save the PDF
    pdf.save(finalFilename);

    // Show hidden elements again
    hiddenElements.forEach(el => el.style.display = '');

    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    // Show hidden elements again in case of error
    const hiddenElements = document.querySelectorAll('.print\\:hidden');
    hiddenElements.forEach(el => el.style.display = '');
    throw error;
  }
};

export const printForm = () => {
  // Simple print function
  window.print();
};