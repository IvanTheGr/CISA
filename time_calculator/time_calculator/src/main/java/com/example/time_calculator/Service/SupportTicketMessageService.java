package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Entity.SupportTicketMessage;
import com.example.time_calculator.Entity.WebsiteSupportTicketState;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Repository.SupportTicketMessageRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.Repository.WebsiteSupportTicketStateRepository;
import com.example.time_calculator.dto.MessageAttachmentDTO;
import com.example.time_calculator.dto.MessageStateDTO;
import com.example.time_calculator.dto.SupportTicketMessageDTO;
import com.example.time_calculator.dto.TicketMessageResponseDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SupportTicketMessageService {

    @Autowired
    SupportTicketMessageRepository repository;

    @Autowired
    SupportTicketRepository supportTicketRepository;

    @Autowired
    ResUsersRepository resUsersRepository;

    @Autowired
    TicketStateService ticketStateService;

    @Autowired
    WebsiteSupportTicketStateRepository websiteSupportTicketStateRepository;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.message-dir:ticket-messages}")
    private String messageDir;

    public List<SupportTicketMessage> GetAllSupportTicketMessage() {
        return repository.findAll();
    }



    public SupportTicketMessage findSupportTicketMessageById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<SupportTicketMessage> findSupportTicketMessagesByTicketNumber(String ticketNumber) {
        return repository.findByTicketNumber(ticketNumber);
    }

    public List<SupportTicketMessage> findSupportTicketMessagesByTicketId(Long ticketId) {
        return repository.findAllByTicketIdOrderByIdAsc(ticketId);
    }

    public List<TicketMessageResponseDTO> findSupportTicketMessageResponsesByTicketId(Long ticketId) {
        return repository.findAllByTicketIdOrderByCreateDateAsc(ticketId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public List<TicketMessageResponseDTO> findSupportTicketMessageResponsesByTicketNumber(String ticketNumber) {
        return repository.findByTicketNumber(ticketNumber)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public List<TicketMessageResponseDTO> getAllSupportTicketMessageResponses() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Transactional
    public TicketMessageResponseDTO updateSupportTicketMessageEditableFields(
            Long id,
            SupportTicketMessageDTO dto
    ) {
        SupportTicketMessage existingMessage =
                repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Message not found id=" + id));

        int updated = repository.updateMessageEditableFields(
                id,
                dto.getContent(),
                dto.getCreateDate(),
                dto.getResponseTime(),
                dto.getResolutionTime()
        );

        if (updated == 0) {
            throw new RuntimeException("Message gagal diupdate id=" + id);
        }

        /*
         * MANUAL MODE:
         * Jangan panggil recalculateMessageSla().
         * Jangan panggil recalculateTicketSlaFields().
         * Karena itu akan menimpa Response Time dan Resolution Time manual.
         */

        Long ticketId = existingMessage.getTicketId();

        if (ticketId != null) {
            updateStateTicket(ticketId);
        }

        SupportTicketMessage updatedMessage =
                repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Message not found after update id=" + id));

        return mapToResponseDTO(updatedMessage);
    }

    @Transactional
    public TicketMessageResponseDTO sendMessage(
            Long ticketId,
            String content,
            List<MultipartFile> files,
            String login
    ) {
        System.out.println("=== SEND MESSAGE DEBUG START ===");
        System.out.println("ticketId = " + ticketId);
        System.out.println("login    = " + login);
        System.out.println("content  = " + content);
        System.out.println("files    = " + (files == null ? "null" : files.size()));
        if (files != null) {
            for (MultipartFile f : files) {
                System.out.println("file name = " + f.getOriginalFilename());
                System.out.println("file size = " + f.getSize());
                System.out.println("file type = " + f.getContentType());
            }
        }
        try {
            SupportTicket ticket = supportTicketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));

            if (ticket.getUserId() == null) {
                throw new RuntimeException("Ticket must be assigned first before sending a reply.");
            }

            boolean emptyContent = content == null || content.trim().isEmpty();
            boolean emptyFiles = files == null || files.isEmpty();

            if (emptyContent && emptyFiles) {
                throw new RuntimeException("Message content or attachment is required.");
            }

            ResUsers currentUser = resUsersRepository.findByLoginAndActiveTrue(login)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            LocalDateTime nowDb = LocalDateTime.now().minusHours(7);

            String by = resolveMessageBy(ticket, currentUser);
            WebsiteSupportTicketState nextState = resolveReplyState(by);

            if (nextState != null) {
                ticket.setStateId(nextState.getId());
                ticket.setStateName(nextState.getName());
            }

            ticket.setTelegramToRelated(true);
            ticket.setMailToRelated(true);
            ticket.setWriteUid(currentUser.getId());
            ticket.setWriteDate(LocalDateTime.now());

            SupportTicketMessage msg = new SupportTicketMessage();
            msg.setTicketId(ticketId);
            msg.setUserId(currentUser.getId());
            msg.setCreateUid(currentUser);
            msg.setWriteUid(currentUser);
            msg.setCreateDate(nowDb);
            msg.setWriteDate(nowDb);
            msg.setContent(emptyContent ? "" : content);
            msg.setStateId(ticket.getStateId());
            msg.setBy(by);
            msg.setResponseTime(0.0);
            msg.setResolutionTime(0.0);

            SupportTicketMessage saved = repository.save(msg);
            supportTicketRepository.save(ticket);

            saveAttachmentsToIrAttachment(saved.getId(), files, currentUser, nowDb);

            updateStateTicket(ticketId);

            return mapToResponseDTO(
                    repository.findById(saved.getId())
                            .orElseThrow(() -> new RuntimeException("Saved message not found"))
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("sendMessage failed: " + e.getMessage(), e);
        }
    }

    private void saveAttachmentsToIrAttachment(
            Long messageId,
            List<MultipartFile> files,
            ResUsers currentUser,
            LocalDateTime nowDb
    ) {
        if (files == null || files.isEmpty()) return;

        Path baseDir = Paths.get(uploadDir, messageDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(baseDir);

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;

                if (file.getSize() > 9L * 1024L * 1024L) {
                    throw new RuntimeException("Attachment size must be smaller than 9 MB!");
                }

                String originalName = StringUtils.cleanPath(file.getOriginalFilename());
                String storedName = UUID.randomUUID() + "_" + originalName;
                Path target = baseDir.resolve(storedName);

                String lowerName = originalName.toLowerCase();

                boolean allowed =
                        lowerName.endsWith(".png") ||
                                lowerName.endsWith(".jpg") ||
                                lowerName.endsWith(".jpeg") ||
                                lowerName.endsWith(".gif") ||
                                lowerName.endsWith(".webp") ||
                                lowerName.endsWith(".pdf") ||
                                lowerName.endsWith(".doc") ||
                                lowerName.endsWith(".docx") ||
                                lowerName.endsWith(".xls") ||
                                lowerName.endsWith(".xlsx") ||
                                lowerName.endsWith(".zip") ||
                                lowerName.endsWith(".txt");

                if (!allowed) {
                    throw new RuntimeException("File type is not supported. Please use PNG, JPG, JPEG, PDF, DOCX, XLSX, ZIP, or TXT.");
                }


                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                String publicUrl = "/uploads/" + messageDir + "/" + storedName;

                Long attachmentId = insertIrAttachment(
                        originalName,
                        originalName,
                        "website.support.ticket.message",
                        messageId,
                        publicUrl,
                        storedName,
                        file.getSize(),
                        file.getContentType(),
                        currentUser.getId(),
                        nowDb
                );

                jdbcTemplate.update(
                        "INSERT INTO ptap_attachment_ticket_message (ticket_message_id, attach_id) VALUES (?, ?)",
                        messageId,
                        attachmentId
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to store attachment: " + e.getMessage(), e);
        }
    }

    private Long insertIrAttachment(
            String name,
            String datasFname,
            String resModel,
            Long resId,
            String url,
            String storedName,
            Long fileSize,
            String mimeType,
            Long userId,
            LocalDateTime nowDb
    ) {
        try {
            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO ir_attachment
                    (name, datas_fname, res_model, res_id, type, url, store_fname,
                     file_size, mimetype, create_uid, create_date, write_uid, write_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);

                ps.setString(1, name);
                ps.setString(2, datasFname);
                ps.setString(3, resModel);
                ps.setLong(4, resId);
                ps.setString(5, "url");
                ps.setString(6, url);
                ps.setString(7, storedName);
                ps.setLong(8, fileSize != null ? fileSize : 0L);
                ps.setString(9, mimeType);
                ps.setLong(10, userId);
                ps.setObject(11, nowDb);
                ps.setLong(12, userId);
                ps.setObject(13, nowDb);

                return ps;
            }, keyHolder);

            Map<String, Object> keys = keyHolder.getKeys();
            if (keys != null && keys.containsKey("id")) {
                Object idValue = keys.get("id");
                if (idValue instanceof Number number) {
                    return number.longValue();
                }
            }

            throw new RuntimeException("Failed to create ir_attachment: no generated id returned");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("insertIrAttachment failed: " + e.getMessage(), e);
        }
    }

    private TicketMessageResponseDTO mapToResponseDTO(SupportTicketMessage msg) {
        WebsiteSupportTicketState state = null;
        if (msg.getStateId() != null) {
            state = websiteSupportTicketStateRepository.findById(msg.getStateId()).orElse(null);
        }

        List<MessageAttachmentDTO> attachments = loadAttachments(msg.getId());

        return TicketMessageResponseDTO.builder()
                .id(msg.getId())
                .by(msg.getBy())
                .content(msg.getContent())
                .createDate(msg.getCreateDate())
                .responseTime(msg.getResponseTime())
                .resolutionTime(msg.getResolutionTime())
                .state(MessageStateDTO.builder()
                        .id(state != null ? state.getId() : null)
                        .name(state != null ? state.getName() : "-")
                        .build())
                .attachments(attachments)
                .build();
    }

    private List<MessageAttachmentDTO> loadAttachments(Long messageId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
            SELECT a.id,
                   COALESCE(a.datas_fname, a.name) AS file_name,
                   a.mimetype,
                   a.url,
                   a.store_fname
            FROM ir_attachment a
            JOIN ptap_attachment_ticket_message rel
              ON rel.attach_id = a.id
            WHERE rel.ticket_message_id = ?
            ORDER BY a.id ASC
            """, messageId);

        List<MessageAttachmentDTO> result = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            String url = row.get("url") != null ? row.get("url").toString() : null;
            String storeFname = row.get("store_fname") != null ? row.get("store_fname").toString() : null;

            if ((url == null || url.isBlank()) && storeFname != null && !storeFname.isBlank()) {
                url = "/uploads/" + messageDir + "/" + storeFname;
            }

            result.add(MessageAttachmentDTO.builder()
                    .id(((Number) row.get("id")).longValue())
                    .fileName((String) row.get("file_name"))
                    .contentType((String) row.get("mimetype"))
                    .url(url)
                    .build());
        }
        return result;
    }

    private String resolveMessageBy(SupportTicket ticket, ResUsers currentUser) {
        if ("customer".equalsIgnoreCase(ticket.getChannel())) {
            if (currentUser.getPartner() != null
                    && ticket.getPartnerId() != null
                    && ticket.getPartnerId().equals(currentUser.getPartner().getId())) {
                return "customer";
            }
        }

        List<String> roles = resUsersRepository.findGroupNamesByLogin(currentUser.getLogin());
        boolean isManager = roles.stream().anyMatch(r ->
                r != null && r.toLowerCase().contains("manager")
        );

        return isManager ? "manager" : "staff";
    }

    private WebsiteSupportTicketState resolveReplyState(String by) {
        if ("customer".equalsIgnoreCase(by)) {
            return ticketStateService.getStateByName("Customer Replied");
        }
        if ("manager".equalsIgnoreCase(by)) {
            return ticketStateService.getStateByName("Manager Replied");
        }
        return ticketStateService.getStateByName("Staff Replied");
    }

    @Transactional
    public void recalculateMessageSla(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        List<SupportTicketMessage> ascList = repository.findAllByTicketIdOrderByCreateDateAsc(ticketId);

        for (SupportTicketMessage m : ascList) {
            m.setResponseTime(0.0);
            m.setResolutionTime(0.0);
        }
        repository.saveAll(ascList);

        calculateResponseTime(ticket, ascList);
        calculateResolutionTime(ticket, ascList);

        if (ticket.getCloseTime() != null) {
            calculateResolutionTimeClosed(ticket, ascList);
        }
    }

    private void calculateResponseTime(SupportTicket ticket, List<SupportTicketMessage> convIds) {
        if (convIds.isEmpty()) return;

        int current = 0;
        LocalDateTime first = null;

        for (SupportTicketMessage conv : convIds) {
            if (current == 0) {
                if (!"customer".equalsIgnoreCase(conv.getBy())) {
                    conv.setResponseTime(0.0);
                    repository.save(conv);
                    break;
                } else {
                    first = conv.getCreateDate();
                }
            } else {
                if (!"customer".equalsIgnoreCase(conv.getBy())) {
                    double responseHours = Duration.between(first, conv.getCreateDate()).toSeconds() / 3600.0;
                    conv.setResponseTime(responseHours);
                    repository.save(conv);
                    break;
                }
            }
            current++;
        }
    }

    private void calculateResolutionTime(SupportTicket ticket, List<SupportTicketMessage> ascList) {
        List<SupportTicketMessage> descList = ascList.stream()
                .sorted((a, b) -> b.getCreateDate().compareTo(a.getCreateDate()))
                .toList();

        boolean hasResolution = descList.stream()
                .anyMatch(x -> x.getResolutionTime() != null && x.getResolutionTime() != 0);

        if ("staff".equalsIgnoreCase(ticket.getChannel()) && !hasResolution) {
            int current = 0;
            LocalDateTime replyTime = null;

            for (SupportTicketMessage conv : ascList) {
                if (current == 0) {
                    if (!"customer".equalsIgnoreCase(conv.getBy())) {
                        replyTime = conv.getCreateDate();
                    } else {
                        break;
                    }
                } else {
                    if ("customer".equalsIgnoreCase(conv.getBy())) {
                        current++;
                        continue;
                    } else {
                        double resolutionHours =
                                Duration.between(replyTime, conv.getCreateDate()).toSeconds() / 3600.0;
                        conv.setResolutionTime(resolutionHours);
                        repository.save(conv);
                    }
                }
                current++;
            }
            return;
        }

        int current = 0;
        LocalDateTime replyTime = null;
        SupportTicketMessage replyMessage = null;

        for (SupportTicketMessage conv : descList) {
            if (current == 0) {
                if (!"customer".equalsIgnoreCase(conv.getBy())
                        && conv.getResponseTime() != null
                        && conv.getResponseTime() == 0) {
                    replyTime = conv.getCreateDate();
                    replyMessage = conv;
                } else {
                    break;
                }
            } else {
                if ("customer".equalsIgnoreCase(conv.getBy())) {
                    double resolutionHours =
                            Duration.between(conv.getCreateDate(), replyTime).toSeconds() / 3600.0;
                    if (replyMessage != null) {
                        replyMessage.setResolutionTime(resolutionHours);
                        repository.save(replyMessage);
                    }
                } else {
                    break;
                }
            }
            current++;
        }
    }

    private void calculateResolutionTimeClosed(SupportTicket ticket, List<SupportTicketMessage> ascList) {
        List<SupportTicketMessage> descList = ascList.stream()
                .sorted((a, b) -> b.getCreateDate().compareTo(a.getCreateDate()))
                .toList();

        int current = 0;
        LocalDateTime replyTime = null;
        SupportTicketMessage replyMessage = null;

        for (SupportTicketMessage conv : descList) {
            if (current == 0) {
                replyTime = conv.getCreateDate();
                replyMessage = conv;
            } else {
                boolean skip = !"customer".equalsIgnoreCase(conv.getBy())
                        && safeDouble(conv.getResolutionTime()) == 0
                        && safeDouble(conv.getResponseTime()) == 0;

                if (skip) {
                    current++;
                    continue;
                }

                double resolutionHours =
                        Duration.between(conv.getCreateDate(), replyTime).toSeconds() / 3600.0;

                if (replyMessage != null) {
                    if (descList.size() - 1 == current && current == 1) {
                        replyMessage.setResponseTime(resolutionHours);
                        replyMessage.setResolutionTime(0.0);
                    } else {
                        replyMessage.setResolutionTime(resolutionHours);
                    }
                    repository.save(replyMessage);
                }
                break;
            }
            current++;
        }
    }

    @Transactional
    public void recalculateTicketSlaFields(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        List<SupportTicketMessage> messages = repository.findAllByTicketIdOrderByCreateDateAsc(ticketId);

        SupportTicketMessage firstResponseMsg = messages.stream()
                .filter(m -> safeDouble(m.getResponseTime()) > 0)
                .findFirst()
                .orElse(
                        messages.stream()
                                .filter(m -> safeDouble(m.getResponseTime()) == 0)
                                .findFirst()
                                .orElse(null)
                );

        if (firstResponseMsg != null) {
            ticket.setStartResolutionTime(firstResponseMsg.getCreateDate().plusHours(7));
            ticket.setStartResolutionTimeNoGmt(firstResponseMsg.getCreateDate());
            ticket.setResponseTime(firstResponseMsg.getResponseTime());
        }

        if (ticket.getCloseTime() != null) {
            SupportTicketMessage lastResolutionMsg = messages.stream()
                    .filter(m -> safeDouble(m.getResolutionTime()) > 0)
                    .reduce((a, b) -> b)
                    .orElse(null);

            if (lastResolutionMsg != null) {
                ticket.setEndResolutionTime(lastResolutionMsg.getCreateDate().plusHours(7));
                ticket.setEndResolutionTimeNoGmt(lastResolutionMsg.getCreateDate());
            }
        }

        double totalResolution = messages.stream()
                .mapToDouble(m -> safeDouble(m.getResolutionTime()))
                .sum();

        ticket.setResolutionTime(totalResolution);

        if (ticket.getCreateDate() != null && ticket.getCloseTime() != null) {
            double totalHours =
                    Duration.between(ticket.getCreateDate(), ticket.getCloseTime()).toSeconds() / 3600.0;
            ticket.setResponseToClose(totalHours);
        }

        supportTicketRepository.save(ticket);
    }

    @Transactional
    public void updateStateTicket(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getUserId() == null) {
            ticket.setStateTicket("open");
        } else if (safeDouble(ticket.getResponseTime()) < 0 || safeDouble(ticket.getResolutionTime()) < 0) {
            if (ticket.getStateName() != null && ticket.getStateName().toLowerCase().contains("closed")) {
                ticket.setStateTicket("done_r");
            } else {
                ticket.setStateTicket("on_r");
            }
        } else if (ticket.getStateName() != null && ticket.getStateName().toLowerCase().contains("closed")) {
            ticket.setStateTicket("done_g");
        } else {
            ticket.setStateTicket("on");
        }

        supportTicketRepository.save(ticket);
    }

    private double safeDouble(Double value) {
        return value == null ? 0.0 : value;
    }
}