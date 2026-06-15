package com.example.time_calculator.Service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WordTemplateService
 *
 * Loads template: src/main/resources/templates/template.docx
 *
 * ── Supported placeholders ──────────────────────────────────────────────────
 *
 *  Ticket identity
 *    {{ticket_number}}     wst.ticket_number
 *    {{subject}}           wst.subject
 *    {{description}}       wst.description_text  (plain-text version)
 *
 *  Company / customer
 *    {{customer_name}}     res_partner (via wst.partner_id)
 *    {{parent_company}}    res_partner (via wst.parent_company_id)
 *    {{email}}             wst.email
 *    {{phone}}             wst.user_id_phone
 *
 *  Classification
 *    {{product_name}}      product_template (via wst.product_id)
 *    {{category}}          website_support_ticket_category (via wst.category_id)
 *    {{sub_category}}      website_support_ticket_subcategory (via wst.sub_category_id)
 *    {{priority}}          website_support_ticket_priority (via wst.priority_id)
 *    {{status}}            website_support_ticket_state (via wst.state_id)
 *
 *  Personnel
 *    {{pic}}               res_partner.name  (via ptap_incident_log.pic_user_id → res_users → res_partner)
 *    {{engineer}}          same as {{pic}} — alias for backward compat
 *
 *  Dates
 *    {{date_created}}      wst.create_date
 *    {{date_closed}}       wst.close_time
 *
 *  Incident log detail  (from ptap_incident_log)
 *    {{issue}}             pil.issue
 *    {{impact}}            pil.impact
 *    {{environment}}       pil.environment
 *    {{chronology}}        pil.chronology
 *    {{root_cause}}        pil.root_cause
 *    {{workaround}}        pil.workaround
 *    {{recommendation}}    pil.recommendation
 *    {{permanent_solution}} pil.permanent_solution
 *    {{notes}}             pil.notes
 *
 *  Summary / meta
 *    {{record_count}}      total number of tickets in this export
 *    {{row_number}}        per-row counter (table rows only)
 *
 * ── ERD tables used ─────────────────────────────────────────────────────────
 *   website_support_ticket            (wst)
 *   res_partner                       (rp_partner, rp_parent, rp_pic)
 *   product_template                  (pt)
 *   website_support_ticket_category   (wstcat)
 *   website_support_ticket_subcategory(wstsub)
 *   website_support_ticket_priority   (wstpri)
 *   website_support_ticket_state      (wststate)
 *   ptap_incident_log                 (pil)
 *   res_users                         (ru_pic)
 * ────────────────────────────────────────────────────────────────────────────
 */
@Service
@RequiredArgsConstructor
public class WordTemplateService {

    private final JdbcTemplate jdbc;

    private static final String TEMPLATE_PATH = "templates/template.docx";

    // ── SQL — ALL tickets ────────────────────────────────────────────────────
    private static final String SQL_ALL = """
            SELECT
                wst.ticket_number                       AS ticket_number,
                wst.subject                             AS subject,
                wst.description_text                    AS description,
                wst.email                               AS email,
                wst.user_id_phone                       AS phone,
                rp_partner.name                         AS customer_name,
                rp_parent.name                          AS parent_company,
                pt.name                                 AS product_name,
                wstcat.name                             AS category,
                wstsub.name                             AS sub_category,
                wstpri.name                             AS priority,
                wststate.name                           AS status,
                rp_pic.name                             AS pic,
                wst.create_date                         AS date_created,
                wst.close_time                          AS date_closed,
                pil.issue                               AS issue,
                pil.impact                              AS impact,
                pil.environment                         AS environment,
                pil.chronology                          AS chronology,
                pil.root_cause                          AS root_cause,
                pil.workaround                          AS workaround,
                pil.recommendation                      AS recommendation,
                pil.permanent_solution                  AS permanent_solution,
                pil.notes                               AS notes
            FROM website_support_ticket wst
            LEFT JOIN res_partner       rp_partner  ON rp_partner.id  = wst.partner_id
            LEFT JOIN res_partner       rp_parent   ON rp_parent.id   = wst.parent_company_id
            LEFT JOIN product_template  pt          ON pt.id          = wst.product_id
            LEFT JOIN website_support_ticket_category    wstcat   ON wstcat.id   = wst.category_id
            LEFT JOIN website_support_ticket_subcategory wstsub   ON wstsub.id   = wst.sub_category_id
            LEFT JOIN website_support_ticket_priority    wstpri   ON wstpri.id   = wst.priority_id
            LEFT JOIN website_support_ticket_state       wststate ON wststate.id = wst.state_id
            LEFT JOIN ptap_incident_log pil         ON pil.ticket_id  = wst.id
            LEFT JOIN res_users         ru_pic      ON ru_pic.id      = pil.pic_user_id
            LEFT JOIN res_partner       rp_pic      ON rp_pic.id      = ru_pic.partner_id
            ORDER BY wst.create_date DESC
            """;

    // ── SQL — filtered by partner / parent company name ──────────────────────
    private static final String SQL_BY_PARTNER = """
            SELECT
                wst.ticket_number                       AS ticket_number,
                wst.subject                             AS subject,
                wst.description_text                    AS description,
                wst.email                               AS email,
                wst.user_id_phone                       AS phone,
                rp_partner.name                         AS customer_name,
                rp_parent.name                          AS parent_company,
                pt.name                                 AS product_name,
                wstcat.name                             AS category,
                wstsub.name                             AS sub_category,
                wstpri.name                             AS priority,
                wststate.name                           AS status,
                rp_pic.name                             AS pic,
                wst.create_date                         AS date_created,
                wst.close_time                          AS date_closed,
                pil.issue                               AS issue,
                pil.impact                              AS impact,
                pil.environment                         AS environment,
                pil.chronology                          AS chronology,
                pil.root_cause                          AS root_cause,
                pil.workaround                          AS workaround,
                pil.recommendation                      AS recommendation,
                pil.permanent_solution                  AS permanent_solution,
                pil.notes                               AS notes
            FROM website_support_ticket wst
            LEFT JOIN res_partner       rp_partner  ON rp_partner.id  = wst.partner_id
            LEFT JOIN res_partner       rp_parent   ON rp_parent.id   = wst.parent_company_id
            LEFT JOIN product_template  pt          ON pt.id          = wst.product_id
            LEFT JOIN website_support_ticket_category    wstcat   ON wstcat.id   = wst.category_id
            LEFT JOIN website_support_ticket_subcategory wstsub   ON wstsub.id   = wst.sub_category_id
            LEFT JOIN website_support_ticket_priority    wstpri   ON wstpri.id   = wst.priority_id
            LEFT JOIN website_support_ticket_state       wststate ON wststate.id = wst.state_id
            LEFT JOIN ptap_incident_log pil         ON pil.ticket_id  = wst.id
            LEFT JOIN res_users         ru_pic      ON ru_pic.id      = pil.pic_user_id
            LEFT JOIN res_partner       rp_pic      ON rp_pic.id      = ru_pic.partner_id
            WHERE rp_partner.name = ?
               OR rp_parent.name  = ?
            ORDER BY wst.create_date DESC
            """;

    // ── Public API ───────────────────────────────────────────────────────────

    public byte[] exportAll() throws IOException {
        List<Map<String, Object>> rows = jdbc.queryForList(SQL_ALL);
        return fillTemplate(rows);
    }

    public byte[] exportByPartner(String partnerName) throws IOException {
        List<Map<String, Object>> rows = jdbc.queryForList(SQL_BY_PARTNER,
                partnerName, partnerName);
        return fillTemplate(rows);
    }

    // ── Template engine ──────────────────────────────────────────────────────

    private byte[] fillTemplate(List<Map<String, Object>> rows) throws IOException {
        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);

        try (InputStream templateStream = resource.getInputStream();
             XWPFDocument doc = new XWPFDocument(templateStream);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            if (rows.isEmpty()) {
                Map<String, String> empty = new HashMap<>();
                empty.put("{{record_count}}", "0");
                fillEmptyPlaceholders(empty);
                replacePlaceholdersInDocument(doc, empty);
            } else if (rows.size() == 1) {
                Map<String, String> placeholders = buildPlaceholderMap(rows.get(0), 1, 1);
                replacePlaceholdersInDocument(doc, placeholders);
            } else {
                // Fill header/summary placeholders using first record
                Map<String, String> placeholders = buildPlaceholderMap(rows.get(0), rows.size(), 1);
                placeholders.put("{{record_count}}", String.valueOf(rows.size()));
                replacePlaceholdersInDocument(doc, placeholders);

                // Clone table rows for all records
                fillTableIfPresent(doc, rows);
            }

            doc.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Replaces all placeholders in paragraphs and table cells of the document.
     */
    private void replacePlaceholdersInDocument(XWPFDocument doc,
                                               Map<String, String> placeholders) {
        for (XWPFParagraph p : doc.getParagraphs()) {
            replacePlaceholdersInParagraph(p, placeholders);
        }
        for (XWPFTable table : doc.getTables()) {
            for (XWPFTableRow tableRow : table.getRows()) {
                for (XWPFTableCell cell : tableRow.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        replacePlaceholdersInParagraph(p, placeholders);
                    }
                }
            }
        }
    }

    /**
     * Handles placeholders split across multiple runs within a paragraph.
     * Collapses all run text, replaces, then writes back to first run.
     */
    private void replacePlaceholdersInParagraph(XWPFParagraph paragraph,
                                                Map<String, String> placeholders) {
        List<XWPFRun> runs = paragraph.getRuns();
        if (runs == null || runs.isEmpty()) return;

        StringBuilder fullText = new StringBuilder();
        for (XWPFRun run : runs) {
            String t = run.getText(0);
            if (t != null) fullText.append(t);
        }

        String combined = fullText.toString();
        boolean changed = false;

        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            if (combined.contains(entry.getKey())) {
                combined = combined.replace(entry.getKey(), entry.getValue());
                changed = true;
            }
        }

        if (changed) {
            runs.get(0).setText(combined, 0);
            for (int i = 1; i < runs.size(); i++) {
                runs.get(i).setText("", 0);
            }
        }
    }

    /**
     * If the template contains a table whose last row has placeholders,
     * clone that row for each record and fill it in.
     */
    private void fillTableIfPresent(XWPFDocument doc, List<Map<String, Object>> rows) {
        for (XWPFTable table : doc.getTables()) {
            int lastRowIdx = table.getNumberOfRows() - 1;
            if (lastRowIdx < 1) continue;

            XWPFTableRow templateRow = table.getRow(lastRowIdx);
            boolean isTemplateRow = templateRow.getTableCells().stream()
                    .flatMap(c -> c.getParagraphs().stream())
                    .anyMatch(p -> p.getText().contains("{{"));

            if (!isTemplateRow) continue;

            for (int i = 0; i < rows.size(); i++) {
                XWPFTableRow newRow = table.createRow();
                Map<String, String> placeholders = buildPlaceholderMap(rows.get(i), rows.size(), i + 1);
                for (XWPFTableCell cell : newRow.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        replacePlaceholdersInParagraph(p, placeholders);
                    }
                }
            }

            table.removeRow(lastRowIdx);
            break;
        }
    }

    // ── Placeholder builders ─────────────────────────────────────────────────

    private Map<String, String> buildPlaceholderMap(Map<String, Object> rec,
                                                    int totalCount,
                                                    int rowNumber) {
        Map<String, String> m = new HashMap<>();

        m.put("{{ticket_number}}",      safe(rec.get("ticket_number")));
        m.put("{{subject}}",            safe(rec.get("subject")));
        m.put("{{description}}",        safe(rec.get("description")));
        m.put("{{email}}",              safe(rec.get("email")));
        m.put("{{phone}}",              safe(rec.get("phone")));
        m.put("{{customer_name}}",      safe(rec.get("customer_name")));
        m.put("{{parent_company}}",     safe(rec.get("parent_company")));
        m.put("{{product_name}}",       safe(rec.get("product_name")));
        m.put("{{category}}",           safe(rec.get("category")));
        m.put("{{sub_category}}",       safe(rec.get("sub_category")));
        m.put("{{priority}}",           safe(rec.get("priority")));
        m.put("{{status}}",             safe(rec.get("status")));
        m.put("{{pic}}",                safe(rec.get("pic")));
        m.put("{{engineer}}",           safe(rec.get("pic")));          // alias
        m.put("{{company_name}}",       safe(rec.get("customer_name"))); // alias
        m.put("{{date_created}}",       formatDate(rec.get("date_created")));
        m.put("{{date}}",               formatDate(rec.get("date_created"))); // alias
        m.put("{{date_closed}}",        formatDate(rec.get("date_closed")));
        m.put("{{date_resolved}}",      formatDate(rec.get("date_closed")));  // alias
        m.put("{{issue}}",              safe(rec.get("issue")));
        m.put("{{impact}}",             safe(rec.get("impact")));
        m.put("{{environment}}",        safe(rec.get("environment")));
        m.put("{{chronology}}",         safe(rec.get("chronology")));
        m.put("{{root_cause}}",         safe(rec.get("root_cause")));
        m.put("{{workaround}}",         safe(rec.get("workaround")));
        m.put("{{recommendation}}",     safe(rec.get("recommendation")));
        m.put("{{permanent_solution}}", safe(rec.get("permanent_solution")));
        m.put("{{notes}}",              safe(rec.get("notes")));
        m.put("{{record_count}}",       String.valueOf(totalCount));
        m.put("{{row_number}}",         String.valueOf(rowNumber));

        return m;
    }

    /** Fills all known placeholders with "-" for the empty-results case. */
    private void fillEmptyPlaceholders(Map<String, String> m) {
        String[] keys = {
                "{{ticket_number}}", "{{subject}}", "{{description}}", "{{email}}",
                "{{phone}}", "{{customer_name}}", "{{parent_company}}", "{{product_name}}",
                "{{category}}", "{{sub_category}}", "{{priority}}", "{{status}}",
                "{{pic}}", "{{engineer}}", "{{company_name}}", "{{date_created}}",
                "{{date}}", "{{date_closed}}", "{{date_resolved}}", "{{issue}}",
                "{{impact}}", "{{environment}}", "{{chronology}}", "{{root_cause}}",
                "{{workaround}}", "{{recommendation}}", "{{permanent_solution}}",
                "{{notes}}", "{{row_number}}"
        };
        for (String k : keys) m.put(k, "-");
    }

    // ── Utilities ────────────────────────────────────────────────────────────

    private String safe(Object val) {
        return (val == null || val.toString().isBlank()) ? "-" : val.toString().trim();
    }

    private String formatDate(Object val) {
        if (val == null) return "-";
        if (val instanceof java.sql.Timestamp ts) {
            return ts.toLocalDateTime()
                    .format(DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm"));
        }
        if (val instanceof java.sql.Date d) {
            return d.toLocalDate()
                    .format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        }
        return val.toString().isBlank() ? "-" : val.toString();
    }
}
