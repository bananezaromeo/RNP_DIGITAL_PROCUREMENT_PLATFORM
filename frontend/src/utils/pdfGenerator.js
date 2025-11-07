import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateDistrictPDF = (requests) => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("District Requests Report", 14, 20);

  const tableColumn = ["#", "Station", "Product", "Quantity (kg)", "Status", "Date"];
  const tableRows = [];

  requests.forEach((r, idx) => {
    tableRows.push([
      idx + 1,
      r.stationId,
      r.productId,
      r.quantity,
      r.status,
      new Date(r.createdAt).toLocaleDateString(),
    ]);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save("district_report.pdf");
};
