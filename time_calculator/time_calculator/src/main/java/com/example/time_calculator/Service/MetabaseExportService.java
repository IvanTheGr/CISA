package com.example.time_calculator.Service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Generates an Excel (.xlsx) file from the same dataset
 * displayed in the Metabase dashboard.
 *
 * Uses JdbcTemplate to run the same SQL query Metabase uses
 * (copy the SQL from your Metabase question/card editor).
 */
@Service
@RequiredArgsConstructor
public class MetabaseExportService {

    private final JdbcTemplate jdbc;

    // ── SQL queries (replace with your actual Metabase card SQL) ────────────

    /** All data — used for privileged roles (managers, staff). */
    private static final String SQL_ALL = """
            SELECT
                t.id                AS "Ticket ID",
                t.name              AS "Subject",
                t.partner_id        AS "Partner ID",
                rp.name             AS "Partner Name",
                t.create_date       AS "Created At",
                t.date_done         AS "Resolved At",
                t.stage_id          AS "Stage",
                il.root_cause       AS "Root Cause",
                il.workaround       AS "Workaround",
                il.recommendation   AS "Recommendation"
            FROM helpdesk_ticket t
            LEFT JOIN res_partner rp ON rp.id = t.partner_id
            LEFT JOIN ptap_incident_log il ON il.ticket_id = t.id
            ORDER BY t.create_date DESC
            """;

    /** Filtered by partner — used for non-privileged roles. */
    private static final String SQL_BY_PARTNER = """
            SELECT
                t.id                AS "Ticket ID",
                t.name              AS "Subject",
                rp.name             AS "Partner Name",
                t.create_date       AS "Created At",
                t.date_done         AS "Resolved At",
                t.stage_id          AS "Stage",
                il.root_cause       AS "Root Cause",
                il.workaround       AS "Workaround",
                il.recommendation   AS "Recommendation"
            FROM helpdesk_ticket t
            LEFT JOIN res_partner rp ON rp.id = t.partner_id
            LEFT JOIN ptap_incident_log il ON il.ticket_id = t.id
            WHERE rp.name = ?
            ORDER BY t.create_date DESC
            """;

    // ── Public API ───────────────────────────────────────────────────────────

    public byte[] exportAll() throws IOException {
        List<Map<String, Object>> rows = jdbc.queryForList(SQL_ALL);
        return buildExcel("All Tickets", rows);
    }

    public byte[] exportByPartner(String partnerName) throws IOException {
        List<Map<String, Object>> rows = jdbc.queryForList(SQL_BY_PARTNER, partnerName);
        return buildExcel("Tickets - " + partnerName, rows);
    }

    // ── Excel builder ────────────────────────────────────────────────────────

    private byte[] buildExcel(String sheetTitle, List<Map<String, Object>> rows)
            throws IOException {

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet(sheetTitle);

            // ── Styles ────────────────────────────────────────────────
            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle dateStyle   = createDateStyle(wb);
            CellStyle bodyStyle   = createBodyStyle(wb);

            if (rows.isEmpty()) {
                sheet.createRow(0).createCell(0).setCellValue("No data found.");
                wb.write(out);
                return out.toByteArray();
            }

            // ── Header row ────────────────────────────────────────────
            String[] columns = rows.get(0).keySet().toArray(new String[0]);
            Row headerRow = sheet.createRow(0);

            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerStyle);
            }

            // ── Data rows ─────────────────────────────────────────────
            int rowIdx = 1;
            for (Map<String, Object> record : rows) {
                Row row = sheet.createRow(rowIdx++);

                for (int col = 0; col < columns.length; col++) {
                    Cell cell = row.createCell(col);
                    Object val = record.get(columns[col]);

                    if (val == null) {
                        cell.setCellValue("-");
                        cell.setCellStyle(bodyStyle);
                    } else if (val instanceof java.sql.Timestamp ts) {
                        cell.setCellValue(ts);
                        cell.setCellStyle(dateStyle);
                    } else if (val instanceof java.sql.Date d) {
                        cell.setCellValue(d);
                        cell.setCellStyle(dateStyle);
                    } else if (val instanceof Number n) {
                        cell.setCellValue(n.doubleValue());
                        cell.setCellStyle(bodyStyle);
                    } else {
                        cell.setCellValue(val.toString());
                        cell.setCellStyle(bodyStyle);
                    }
                }
            }

            // ── Auto-size columns (capped at 60 chars wide) ───────────
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
                int width = sheet.getColumnWidth(col);
                if (width > 15_000) sheet.setColumnWidth(col, 15_000);
            }

            // ── Freeze header row ─────────────────────────────────────
            sheet.createFreezePane(0, 1);

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ── Style helpers ────────────────────────────────────────────────────────

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();

        // Dark red background (#872924) — matches your app theme
        style.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        font.setFontName("Arial");
        style.setFont(font);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(IndexedColors.WHITE.getIndex());

        return style;
    }

    private CellStyle createBodyStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();

        Font font = wb.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);

        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(false);

        return style;
    }

    private CellStyle createDateStyle(Workbook wb) {
        CellStyle style = createBodyStyle(wb);
        CreationHelper createHelper = wb.getCreationHelper();
        style.setDataFormat(
            createHelper.createDataFormat().getFormat("yyyy-mm-dd hh:mm")
        );
        return style;
    }
}
