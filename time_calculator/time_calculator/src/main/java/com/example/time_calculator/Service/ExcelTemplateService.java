package com.example.time_calculator.Service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExcelTemplateService {

    private final JdbcTemplate jdbcTemplate;

    private static final String[] HEADERS = {
            "Ticket Number", "Subject", "Person Name", "Email", "Phone",
            "Response Time", "Create Date", "Customer", "Product",
            "Category", "Priority", "Status", "PIC Name",
            "Environment", "Corrective Action", "Notes"
    };

    public byte[] exportFiltered(String startDate, String endDate, String partnerName)
            throws IOException {

        // Normalise: blank → null so "? IS NULL" works correctly in SQL
        String sd = (startDate   == null || startDate.isBlank())   ? null : startDate.trim();
        String ed = (endDate     == null || endDate.isBlank())     ? null : endDate.trim();
        String pn = (partnerName == null || partnerName.isBlank()) ? null : partnerName.trim();

        // FIX: CAST(? AS TIMESTAMP) + INTERVAL '1 day'  — parentheses around CAST first,
        //      then add the interval OUTSIDE the cast expression.
        //      Also removed SQL comments (-- ...) which can cause issues with some JDBC drivers
        //      when the comment consumes the rest of the line in a prepared statement.
        String sql =
                "SELECT" +
                        "    wst.ticket_number," +
                        "    wst.subject," +
                        "    wst.person_name," +
                        "    wst.email," +
                        "    wst.user_id_phone," +
                        "    wst.response_time," +
                        "    wst.create_date," +
                        "    COALESCE(rp_parent.name, rp_partner.name) AS customer_name," +
                        "    pt.name        AS product_name," +
                        "    wstcat.name    AS category," +
                        "    wstpri.name    AS priority," +
                        "    wststate.name  AS status," +
                        "    rp_pic.name    AS pic_name," +
                        "    pil.environment," +
                        "    pil.permanent_solution AS corrective_action," +
                        "    pil.notes " +
                        "FROM website_support_ticket wst " +
                        "LEFT JOIN res_partner rp_partner  ON rp_partner.id  = wst.partner_id " +
                        "LEFT JOIN res_partner rp_parent   ON rp_parent.id   = rp_partner.parent_id " +
                        "LEFT JOIN product_template pt     ON pt.id          = wst.product_id " +
                        "LEFT JOIN website_support_ticket_category wstcat ON wstcat.id  = wst.category_id " +
                        "LEFT JOIN website_support_ticket_priority wstpri ON wstpri.id  = wst.priority_id " +
                        "LEFT JOIN website_support_ticket_state wststate  ON wststate.id = wst.state_id " +
                        "LEFT JOIN ptap_incident_log pil   ON pil.ticket_id  = wst.id " +
                        "LEFT JOIN res_users ru_pic        ON ru_pic.id      = pil.pic_user_id " +
                        "LEFT JOIN res_partner rp_pic      ON rp_pic.id      = ru_pic.partner_id " +
                        "WHERE " +
                        "    (CAST(? AS TIMESTAMP) IS NULL OR wst.create_date >= CAST(? AS TIMESTAMP)) " +
                        "    AND " +
                        "    (CAST(? AS TIMESTAMP) IS NULL OR wst.create_date < (CAST(? AS TIMESTAMP) + INTERVAL '1 day')) " +
                        "    AND " +
                        "    (? IS NULL OR COALESCE(rp_parent.name, rp_partner.name) = ?) " +
                        "ORDER BY wst.create_date DESC";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                sql,
                sd, sd,   // start date
                ed, ed,   // end date (exclusive upper bound: < endDate + 1 day)
                pn, pn    // company name
        );

        return buildExcel(rows);
    }

    private byte[] buildExcel(List<Map<String, Object>> rows) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet("Incident Report");

            // Header style
            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);

            // Data style
            CellStyle dataStyle = wb.createCellStyle();
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setWrapText(true);

            // Header row
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            for (Map<String, Object> row : rows) {
                Row dataRow = sheet.createRow(rowNum++);
                Object[] values = row.values().toArray();
                for (int i = 0; i < values.length; i++) {
                    Cell cell = dataRow.createCell(i);
                    cell.setCellStyle(dataStyle);
                    if (values[i] == null) {
                        cell.setCellValue("");
                    } else if (values[i] instanceof Number num) {
                        cell.setCellValue(num.doubleValue());
                    } else {
                        cell.setCellValue(values[i].toString());
                    }
                }
            }

            // Auto-size columns, cap at ~200px
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }

            wb.write(out);
            return out.toByteArray();
        }
    }
}