package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.PtapIncidentLog;
import com.example.time_calculator.Entity.SupportTicket;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class IncidentWordExportService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateIncidentReport(SupportTicket ticket, PtapIncidentLog log) {
        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            addTitle(doc, "LAPORAN KERUSAKAN (LK)");

            addInfoTable(doc, ticket);

            addSpacing(doc);

            addFormHeader(doc);

            addSection(doc, "ISSUE", log.getIssue());
            addSection(doc, "Impact", log.getImpact());
            addSection(doc, "Environment", log.getEnvironment());
            addSection(doc, "Chronology", log.getChronology());
            addSection(doc, "Workaround", log.getWorkaround());
            addSection(doc, "Permanent Solution", log.getPermanentSolution());
            addSection(doc, "Recommendation", log.getRecommendation());
            addSection(doc, "Notes", log.getNotes());

            doc.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed generate incident report Word: " + e.getMessage(), e);
        }
    }

    private void addTitle(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        p.setSpacingAfter(300);

        XWPFRun run = p.createRun();
        run.setBold(true);
        run.setFontSize(16);
        run.setText(text);
    }

    private void addInfoTable(XWPFDocument doc, SupportTicket ticket) {
        XWPFTable table = doc.createTable(7, 2);
        table.setWidth("100%");

        setRow(table.getRow(0), "No. Ticket", safe(ticket.getTicketNumber()));
        setRow(table.getRow(1), "Date", LocalDate.now().format(DATE_FORMAT));
        setRow(table.getRow(2), "Customer Name", safe(ticket.getPersonName()));
        setRow(table.getRow(3), "PIC (PTAP)", safe(resolvePic(ticket)));
        setRow(table.getRow(4), "Project Name", safe(resolveCompany(ticket)));
        setRow(table.getRow(5), "Product Name", safe(ticket.getProduct() != null ? ticket.getProduct().getName() : null));
        setRow(table.getRow(6), "Category", safe(ticket.getPriority() != null ? ticket.getPriority().getName() : null));
    }

    private void addFormHeader(XWPFDocument doc) {
        XWPFTable table = doc.createTable(4, 2);
        table.setWidth("100%");

        setRow(table.getRow(0), "FORM", "INCIDENT REPORT");
        setRow(table.getRow(1), "Doc. No.", "");
        setRow(table.getRow(2), "Revision No.", "00");
        setRow(table.getRow(3), "Impl. Date", "");

        addSpacing(doc);
    }

    private void addSection(XWPFDocument doc, String title, String body) {
        XWPFParagraph titleP = doc.createParagraph();
        titleP.setSpacingBefore(180);
        titleP.setSpacingAfter(80);

        XWPFRun titleRun = titleP.createRun();
        titleRun.setBold(true);
        titleRun.setFontSize(12);
        titleRun.setText(title);

        XWPFParagraph bodyP = doc.createParagraph();
        bodyP.setSpacingAfter(160);

        XWPFRun bodyRun = bodyP.createRun();
        bodyRun.setFontSize(11);
        bodyRun.setText(safe(body));
    }

    private void addSpacing(XWPFDocument doc) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingAfter(120);
    }

    private void setRow(XWPFTableRow row, String label, String value) {
        setCell(row.getCell(0), label, true);
        setCell(row.getCell(1), value, false);
    }

    private void setCell(XWPFTableCell cell, String text, boolean bold) {
        cell.removeParagraph(0);

        XWPFParagraph p = cell.addParagraph();
        XWPFRun run = p.createRun();

        run.setBold(bold);
        run.setFontSize(11);
        run.setText(safe(text));
    }

    private String resolvePic(SupportTicket ticket) {
        try {
            if (ticket.getPicName() != null && !ticket.getPicName().isBlank()) {
                return ticket.getPicName();
            }
        } catch (Exception ignored) {
        }

        try {
            if (ticket.getUser() != null && ticket.getUser().getPartner() != null) {
                return ticket.getUser().getPartner().getName();
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    private String resolveCompany(SupportTicket ticket) {
        try {
            if (ticket.getPartner() != null && ticket.getPartner().getParent() != null) {
                return ticket.getPartner().getParent().getName();
            }

            if (ticket.getPartner() != null) {
                return ticket.getPartner().getName();
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}