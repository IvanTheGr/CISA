package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResPartner;
import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Entity.SupportTicketMessage;
import com.example.time_calculator.Entity.WebsiteSupportTicketApproval;
import com.example.time_calculator.Entity.WebsiteSupportTicketState;
import com.example.time_calculator.Repository.IrSequenceRepository;
import com.example.time_calculator.Repository.ResPartnerRepository;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Repository.SupportTicketMessageRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.Repository.WebsiteSupportTicketApprovalRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.dto.CloseTicketDTO;
import com.example.time_calculator.dto.CreateTicketDTO;
import com.example.time_calculator.dto.DashboardSummaryDTO;
import com.example.time_calculator.dto.GroupedTicketCompanyDTO;
import com.example.time_calculator.dto.GroupedTicketItemDTO;
import com.example.time_calculator.dto.MyTicketListDTO;
import com.example.time_calculator.dto.SupportTicketDTO;
import com.example.time_calculator.dto.TicketDetailDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.time_calculator.dto.TicketEditResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;





import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class SupportTicketService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;
    @Autowired
    private ResPartnerRepository resPartnerRepository;
    @Autowired
    private ResUsersRepository resUsersRepository;
    @Autowired
    private WebsiteSupportTicketApprovalRepository approvalRepository;
    @Autowired
    private IrSequenceRepository sequenceRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private SlaEngineService slaEngine;
    @Autowired
    private TicketStateService ticketStateService;
    @Autowired
    private SupportTicketMessageRepository supportTicketMessageRepository;
    @Autowired
    private SecurityRoleUtil roleUtil;

    public SupportTicket getSupportTicketByIdSafe(Long id) {
        return supportTicketRepository.findById(id).orElse(null);
    }

    public SupportTicket getSupportTicketByNumber(String ticketNumber) {
        return supportTicketRepository.findByTicketNumber(ticketNumber).orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<SupportTicket> getAllSupportTicket(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> tickets = supportTicketRepository.findAll(pageable);

        tickets.forEach(ticket -> {
            try {
                if (ticket.getPartner() != null) ticket.getPartner().getName();
                if (ticket.getProduct() != null) ticket.getProduct().getName();
                if (ticket.getPriority() != null) ticket.getPriority().getName();
                if (ticket.getUser() != null) ticket.getUser().getId();
            } catch (Exception e) {
                System.out.println("Lazy load error : " + e.getMessage());
            }
        });

        return tickets;
    }

    @Transactional(readOnly = true)
    public List<TicketEditResponseDTO> searchTicketDropdown(String keyword) {
        return supportTicketRepository
                .searchTicketDropdown(keyword)
                .stream()
                .map(this::mapToTicketEditResponseDTO)
                .toList();
    }

    private String generatePortalAccessKey() {
        long number;
        do {
            number = (long) (Math.random() * 9000000000L) + 1000000000L;
        } while (supportTicketRepository.existsByPortalAccessKey(String.valueOf(number)));
        return String.valueOf(number);
    }

    @Transactional
    public SupportTicket createTicket(CreateTicketDTO dto, ResUsers currentUser) {
        SupportTicket ticket = new SupportTicket();

        ticket.setSubject(dto.getSubject());
        ticket.setDescriptionText(dto.getDescriptionText());
        ticket.setDescription(dto.getDescriptionText());
        ticket.setPartnerId(dto.getPartnerId());
        ticket.setPriorityId(dto.getPriorityId());
        ticket.setProductId(dto.getProductId());
        ticket.setCategoryId(dto.getCategoryId());
        ticket.setSubCategoryId(dto.getSubCategoryId());
        ticket.setChannel(dto.getChannel());
        ticket.setPersonName(dto.getPersonName());
        ticket.setEmail(dto.getEmail());

        ticket.setCreateUserId(currentUser.getId());
        ticket.setCreateUid(currentUser.getId());
        ticket.setCompanyId(currentUser.getCompanyId());

        ticket.setCreateDateTime(LocalDateTime.now());
        ticket.setCreateDate(LocalDateTime.now().minusHours(7));

        ticket.setNotifL1(true);
        ticket.setNotifManager(true);

        ticket.setTicketNumber(generateTicketNumber());
        ticket.setUnattended(false);
        ticket.setIsWarranty(false);

        ticket.setTelegramToAll(false);
        ticket.setMailToAll(false);
        ticket.setTelegramToRelated(false);
        ticket.setMailToRelated(false);

        ticket.setEscalationLevel(0);
        ticket.setStateMinim("open");
        ticket.setTicketCategory("non_project");
        ticket.setResponseToClose(0.0);
        ticket.setSlaActive(true);
        ticket.setPortalAccessKey(generatePortalAccessKey());

        WebsiteSupportTicketState state = ticketStateService.getOpenState();
        ticket.setStateId(state.getId());
        ticket.setStateName(state.getName());
        ticket.setStateTicket("open");
        ticket.setWriteUid(currentUser.getId());
        ticket.setWriteDate(LocalDateTime.now());

        WebsiteSupportTicketApproval approval =
                approvalRepository.findByName("No Approval Required").orElse(null);
        if (approval != null) {
            ticket.setApprovalId(approval.getId());
        }

        ResPartner partner = resPartnerRepository.findById(dto.getPartnerId()).orElse(null);
        if (partner != null && partner.getParent() != null) {
            ticket.setParentCompanyId(partner.getParent().getId());
        }

        slaEngine.attachSla(ticket);

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        SupportTicketMessage openingMessage = new SupportTicketMessage();
        openingMessage.setTicketId(savedTicket.getId());
        openingMessage.setUserId(currentUser.getId());
        openingMessage.setStateId(savedTicket.getStateId());
        openingMessage.setBy(resolveOpeningMessageBy(savedTicket.getChannel(), currentUser));
        openingMessage.setContent(savedTicket.getDescription());
        openingMessage.setCreateDate(LocalDateTime.now().minusHours(7));
        openingMessage.setResponseTime(0.0);
        openingMessage.setResolutionTime(0.0);

        supportTicketMessageRepository.save(openingMessage);

        return savedTicket;
    }

    @Transactional
    public TicketEditResponseDTO updateTicketTimestampsOnly(Long id, SupportTicketDTO dto) {
        SupportTicket existingTicket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found " + id));

        LocalDateTime createDateTime = dto.getCreateDateTime() != null
                ? dto.getCreateDateTime()
                : existingTicket.getCreateDateTime();

        LocalDateTime startResolutionTime = dto.getStartResolutionTime() != null
                ? dto.getStartResolutionTime()
                : existingTicket.getStartResolutionTime();

        LocalDateTime endResolutionTime = dto.getEndResolutionTime() != null
                ? dto.getEndResolutionTime()
                : existingTicket.getEndResolutionTime();

        LocalDateTime createDateNoGmt = createDateTime != null
                ? createDateTime.minusHours(7)
                : existingTicket.getCreateDate();

        LocalDateTime startResolutionNoGmt = startResolutionTime != null
                ? startResolutionTime.minusHours(7)
                : existingTicket.getStartResolutionTimeNoGmt();

        LocalDateTime endResolutionNoGmt = endResolutionTime != null
                ? endResolutionTime.minusHours(7)
                : existingTicket.getEndResolutionTimeNoGmt();

        LocalDateTime closeTime = endResolutionNoGmt != null
                ? endResolutionNoGmt
                : existingTicket.getCloseTime();

        java.sql.Date closeDate = closeTime != null
                ? java.sql.Date.valueOf(closeTime.toLocalDate())
                : null;

        Double responseToClose = existingTicket.getResponseToClose();

        if (createDateNoGmt != null && closeTime != null) {
            long totalMs = Duration.between(createDateNoGmt, closeTime).toMillis();
            responseToClose = totalMs / (1000.0 * 60 * 60);
        }

        String sql = """
            UPDATE website_support_ticket
            SET
                create_date_time = ?,
                create_date = ?,
                start_resolution_time = ?,
                start_resolution_time_no_gmt = ?,
                end_resolution_time = ?,
                end_resolution_time_no_gmt = ?,
                close_time = ?,
                close_date = ?,
                response_to_close = ?,
                write_date = NOW()
            WHERE id = ?
            """;

        int updated = jdbcTemplate.update(
                sql,
                createDateTime != null ? Timestamp.valueOf(createDateTime) : null,
                createDateNoGmt != null ? Timestamp.valueOf(createDateNoGmt) : null,
                startResolutionTime != null ? Timestamp.valueOf(startResolutionTime) : null,
                startResolutionNoGmt != null ? Timestamp.valueOf(startResolutionNoGmt) : null,
                endResolutionTime != null ? Timestamp.valueOf(endResolutionTime) : null,
                endResolutionNoGmt != null ? Timestamp.valueOf(endResolutionNoGmt) : null,
                closeTime != null ? Timestamp.valueOf(closeTime) : null,
                closeDate,
                responseToClose,
                id
        );

        if (updated == 0) {
            throw new RuntimeException("Ticket gagal diupdate: " + id);
        }

        return getTicketEditByIdOrNumber(id);
    }

    private String resolveOpeningMessageBy(String channel, ResUsers currentUser) {
        if ("customer".equalsIgnoreCase(channel)) {
            return "customer";
        }

        List<String> roles = resUsersRepository.findGroupNamesByLogin(currentUser.getLogin());
        boolean isManager = roles.stream().anyMatch(r ->
                r != null && r.toLowerCase().contains("manager")
        );

        return isManager ? "manager" : "staff";
    }

    private String resolveUserMessageBy(ResUsers currentUser) {
        List<String> roles = resUsersRepository.findGroupNamesByLogin(currentUser.getLogin());
        boolean isManager = roles.stream().anyMatch(r ->
                r != null && r.toLowerCase().contains("manager")
        );
        return isManager ? "manager" : "staff";
    }

    private String generateTicketNumber() {
        Long nextNumber = sequenceRepository.getNextTicketNumber();
        return String.valueOf(nextNumber);
    }


    @Transactional(readOnly = true)
    public Page<TicketEditResponseDTO> getAllTicketEditDTO(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return supportTicketRepository
                .findAll(pageable)
                .map(this::mapToTicketEditResponseDTO);
    }

    @Transactional(readOnly = true)
    public TicketEditResponseDTO getTicketEditByIdOrNumber(Long value) {
        SupportTicket ticket = supportTicketRepository.findById(value)
                .or(() -> supportTicketRepository.findByTicketNumber(String.valueOf(value)))
                .orElse(null);

        if (ticket == null) {
            return null;
        }

        return mapToTicketEditResponseDTO(ticket);
    }

    @Transactional(readOnly = true)
    public TicketEditResponseDTO getTicketEditByNumber(String ticketNumber) {
        SupportTicket ticket = supportTicketRepository
                .findByTicketNumber(ticketNumber)
                .orElse(null);

        if (ticket == null) {
            return null;
        }

        return mapToTicketEditResponseDTO(ticket);
    }

    private TicketEditResponseDTO mapToTicketEditResponseDTO(SupportTicket ticket) {

        TicketEditResponseDTO.SimpleRefDTO productDto = null;
        if (ticket.getProduct() != null) {
            productDto = TicketEditResponseDTO.SimpleRefDTO.builder()
                    .id(ticket.getProduct().getId())
                    .name(ticket.getProduct().getName())
                    .build();
        }

        TicketEditResponseDTO.SimpleRefDTO priorityDto = null;
        if (ticket.getPriority() != null) {
            priorityDto = TicketEditResponseDTO.SimpleRefDTO.builder()
                    .id(ticket.getPriority().getId())
                    .name(ticket.getPriority().getName())
                    .build();
        }

        TicketEditResponseDTO.SimpleRefDTO stateDto =
                TicketEditResponseDTO.SimpleRefDTO.builder()
                        .id(ticket.getStateId())
                        .name(ticket.getStateName() != null ? ticket.getStateName() : "-")
                        .build();

        TicketEditResponseDTO.PartnerRefDTO parentPartnerDto = null;
        if (ticket.getPartner() != null && ticket.getPartner().getParent() != null) {
            parentPartnerDto = TicketEditResponseDTO.PartnerRefDTO.builder()
                    .id(ticket.getPartner().getParent().getId())
                    .name(ticket.getPartner().getParent().getName())
                    .build();
        }

        TicketEditResponseDTO.PartnerRefDTO partnerDto = null;
        if (ticket.getPartner() != null) {
            partnerDto = TicketEditResponseDTO.PartnerRefDTO.builder()
                    .id(ticket.getPartner().getId())
                    .name(ticket.getPartner().getName())
                    .parent(parentPartnerDto)
                    .build();
        }

        TicketEditResponseDTO.PartnerRefDTO userPartnerDto = null;
        if (ticket.getUser() != null && ticket.getUser().getPartner() != null) {
            userPartnerDto = TicketEditResponseDTO.PartnerRefDTO.builder()
                    .id(ticket.getUser().getPartner().getId())
                    .name(ticket.getUser().getPartner().getName())
                    .build();
        }

        TicketEditResponseDTO.UserRefDTO userDto = null;
        if (ticket.getUser() != null) {
            userDto = TicketEditResponseDTO.UserRefDTO.builder()
                    .id(ticket.getUser().getId())
                    .name(
                            ticket.getUser().getPartner() != null
                                    ? ticket.getUser().getPartner().getName()
                                    : ticket.getUser().getLogin()
                    )
                    .partner(userPartnerDto)
                    .employee(null)
                    .build();
        }

        String companyName = resolveCompanyNameForEdit(ticket);
        String partnerName = resolvePartnerNameForEdit(ticket);
        String assignedPicName = resolveAssignedPicName(ticket);

        return TicketEditResponseDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())

                .subject(ticket.getSubject())
                .channel(ticket.getChannel())

                .stateName(ticket.getStateName())
                .stateTicket(ticket.getStateTicket())

                .customerName(ticket.getPersonName())
                .personName(ticket.getPersonName())
                .email(ticket.getEmail())

                .partnerName(partnerName)
                .companyName(companyName)

                .productName(ticket.getProduct() != null ? ticket.getProduct().getName() : "-")
                .priorityName(ticket.getPriority() != null ? ticket.getPriority().getName() : "-")

                .assignedPic(assignedPicName)
                .picName(assignedPicName)

                .createDate(ticket.getCreateDate())
                .createDateTime(ticket.getCreateDateTime())

                .startResolutionTime(ticket.getStartResolutionTime())
                .endResolutionTime(ticket.getEndResolutionTime())

                .startResolutionTimeNoGmt(ticket.getStartResolutionTimeNoGmt())
                .endResolutionTimeNoGmt(ticket.getEndResolutionTimeNoGmt())

                .closeDate(ticket.getCloseDate())
                .closeTime(ticket.getCloseTime())

                .responseTime(ticket.getResponseTime() != null ? String.valueOf(ticket.getResponseTime()) : "-")
                .resolutionTime(ticket.getResolutionTime() != null ? String.valueOf(ticket.getResolutionTime()) : "-")
                .responseToClose(ticket.getResponseToClose() != null ? String.valueOf(ticket.getResponseToClose()) : "-")

                .slaId(ticket.getSlaId())
                .countdownCondition(ticket.getCountdownCondition())

                .product(productDto)
                .priority(priorityDto)
                .state(stateDto)
                .partner(partnerDto)
                .user(userDto)

                .build();
    }

    private String resolvePartnerNameForEdit(SupportTicket ticket) {
        try {
            if (ticket.getPartner() != null && ticket.getPartner().getName() != null) {
                return ticket.getPartner().getName();
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    private String resolveCompanyNameForEdit(SupportTicket ticket) {
        try {
            if (ticket.getPartner() != null && ticket.getPartner().getParent() != null) {
                String parentName = ticket.getPartner().getParent().getName();
                if (parentName != null && !parentName.isBlank()) {
                    return parentName;
                }
            }

            if (ticket.getPartner() != null && ticket.getPartner().getName() != null) {
                return ticket.getPartner().getName();
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    @Transactional(readOnly = true)
    public String peekNextTicketNumber() {
        Long nextNumber = jdbcTemplate.queryForObject(
                """
                SELECT number_next
                FROM ir_sequence
                WHERE code = 'website.support.ticket'
                """,
                Long.class
        );
        return String.valueOf(nextNumber);
    }

    @Transactional
    public SupportTicket updateSupportTicketById(Long id, SupportTicketDTO dto) {
        SupportTicket existingTicket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found " + id));

        if (dto.getCreateDateTime() != null) {
            existingTicket.setCreateDateTime(dto.getCreateDateTime());
            existingTicket.setCreateDate(dto.getCreateDateTime().minusHours(7));
        }

        if (dto.getStartResolutionTime() != null) {
            existingTicket.setStartResolutionTime(dto.getStartResolutionTime());
            existingTicket.setStartResolutionTimeNoGmt(
                    dto.getStartResolutionTime().minusHours(7)
            );
        }

        if (dto.getEndResolutionTime() != null) {
            existingTicket.setEndResolutionTime(dto.getEndResolutionTime());
            existingTicket.setEndResolutionTimeNoGmt(
                    dto.getEndResolutionTime().minusHours(7)
            );
            existingTicket.setCloseTime(dto.getEndResolutionTime().minusHours(7));
        }

        if (existingTicket.getCloseTime() != null) {
            existingTicket.setCloseDate(existingTicket.getCloseTime().toLocalDate());
        }

        if (existingTicket.getCreateDate() != null && existingTicket.getCloseTime() != null) {
            long totalMs = Duration.between(
                    existingTicket.getCreateDate(),
                    existingTicket.getCloseTime()
            ).toMillis();

            double totalHours = totalMs / (1000.0 * 60 * 60);
            existingTicket.setResponseToClose(totalHours);
        }

        return supportTicketRepository.save(existingTicket);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary(ResUsers currentUser, boolean privileged) {
        if (privileged) {
            Long totalOpen = supportTicketRepository.countOpenTickets();
            Long totalClosed = supportTicketRepository.countClosedTickets();
            Long totalMyOpen = supportTicketRepository.countMyOpenTickets(currentUser.getId());
            Long totalUnassigned = supportTicketRepository.countUnassignedOpenTickets();

            return DashboardSummaryDTO.builder()
                    .totalOpen(totalOpen != null ? totalOpen : 0L)
                    .totalClosed(totalClosed != null ? totalClosed : 0L)
                    .totalMyOpen(totalMyOpen != null ? totalMyOpen : 0L)
                    .totalUnassigned(totalUnassigned != null ? totalUnassigned : 0L)
                    .totalMyTickets(0L)
                    .build();
        }

        Long partnerId = currentUser.getPartner().getId();
        Long companyId = currentUser.getPartner().getParent() != null
                ? currentUser.getPartner().getParent().getId()
                : currentUser.getPartner().getId();

        Long totalMyTickets = supportTicketRepository.countTicketsByCustomerScope(partnerId, companyId);
        Long totalOpen = supportTicketRepository.countOpenTicketsByCustomerScope(partnerId, companyId);
        Long totalClosed = supportTicketRepository.countClosedTicketsByCustomerScope(partnerId, companyId);

        return DashboardSummaryDTO.builder()
                .totalOpen(totalOpen != null ? totalOpen : 0L)
                .totalClosed(totalClosed != null ? totalClosed : 0L)
                .totalMyOpen(0L)
                .totalUnassigned(0L)
                .totalMyTickets(totalMyTickets != null ? totalMyTickets : 0L)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyTicketListDTO> getMyTickets(ResUsers currentUser) {
        Long partnerId = currentUser.getPartner().getId();
        Long companyId = currentUser.getPartner().getParent() != null
                ? currentUser.getPartner().getParent().getId()
                : currentUser.getPartner().getId();

        return supportTicketRepository.findMyTicketsForCustomerScope(partnerId, companyId)
                .stream()
                .map(ticket -> MyTicketListDTO.builder()
                        .id(ticket.getId())
                        .caseNumber(ticket.getTicketNumber())
                        .subject(ticket.getSubject())
                        .priority(ticket.getPriority() != null ? ticket.getPriority().getName() : "-")
                        .account(
                                ticket.getPartner() != null && ticket.getPartner().getParent() != null
                                        ? ticket.getPartner().getParent().getName()
                                        : ticket.getPartner() != null
                                        ? ticket.getPartner().getName()
                                        : "-"
                        )
                        .customerName(ticket.getPersonName() != null ? ticket.getPersonName() : "-")
                        .createdOn(ticket.getCreateDateTime() != null ? ticket.getCreateDateTime() : ticket.getCreateDate())
                        .lastUpdatedOn(ticket.getWriteDate())
                        .state(ticket.getStateName())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GroupedTicketCompanyDTO> getGroupedOpenTicketsForManager() {
        List<SupportTicket> tickets = supportTicketRepository.findAllOpenTicketsForGroupedView();
        return buildGroupedTicketResponse(tickets);
    }

    @Transactional(readOnly = true)
    public List<GroupedTicketCompanyDTO> getGroupedOpenTicketsForStaff(ResUsers currentUser) {
        List<SupportTicket> tickets =
                supportTicketRepository.findOpenTicketsAssignedToUserOrUnassignedForGroupedView(
                        currentUser.getId()
                );

        return buildGroupedTicketResponse(tickets);
    }

    /*
     * Backward compatibility.
     * Kalau masih ada controller/service lama yang manggil method ini,
     * tetap diarahkan ke manager view.
     */
    @Transactional(readOnly = true)
    public List<GroupedTicketCompanyDTO> getGroupedOpenTicketsForInternal() {
        return getGroupedOpenTicketsForManager();
    }

    private List<GroupedTicketCompanyDTO> buildGroupedTicketResponse(List<SupportTicket> tickets) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm:ss");

        Map<String, List<SupportTicket>> grouped = tickets.stream()
                .collect(Collectors.groupingBy(ticket -> {
                    if (ticket.getPartner() != null && ticket.getPartner().getParent() != null) {
                        return ticket.getPartner().getParent().getName();
                    }
                    if (ticket.getPartner() != null && ticket.getPartner().getName() != null) {
                        return ticket.getPartner().getName();
                    }
                    return "No Company";
                }));

        return grouped.entrySet()
                .stream()
                .map(entry -> {
                    List<GroupedTicketItemDTO> items = entry.getValue()
                            .stream()
                            .sorted(Comparator.comparing(
                                    t -> t.getCreateDateTime() != null
                                            ? t.getCreateDateTime()
                                            : t.getCreateDate(),
                                    Comparator.nullsLast(Comparator.reverseOrder())
                            ))
                            .map(ticket -> GroupedTicketItemDTO.builder()
                                    .id(ticket.getId())
                                    .createdOn(
                                            ticket.getCreateDateTime() != null
                                                    ? ticket.getCreateDateTime().format(formatter)
                                                    : ticket.getCreateDate() != null
                                                    ? ticket.getCreateDate().format(formatter)
                                                    : "-"
                                    )
                                    .ticketNumber(ticket.getTicketNumber())
                                    .assignedPic(resolveAssignedPicName(ticket))
                                    .product(ticket.getProduct() != null ? ticket.getProduct().getName() : "-")
                                    .priority(ticket.getPriority() != null ? ticket.getPriority().getName() : "-")
                                    .company(entry.getKey())
                                    .customerName(ticket.getPersonName() != null ? ticket.getPersonName() : "-")
                                    .state(ticket.getStateName() != null ? ticket.getStateName() : "-")
                                    .subject(ticket.getSubject() != null ? ticket.getSubject() : "-")
                                    .statusTicket(ticket.getStateTicket() != null ? ticket.getStateTicket() : "-")
                                    .sortCreatedOn(ticket.getCreateDateTime() != null ? ticket.getCreateDateTime() : ticket.getCreateDate())
                                    .build())
                            .toList();

                    return GroupedTicketCompanyDTO.builder()
                            .companyName(entry.getKey())
                            .total((long) items.size())
                            .tickets(items)
                            .build();
                })
                .sorted(Comparator.comparing(GroupedTicketCompanyDTO::getCompanyName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketDetailDTO getTicketDetail(Long id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return TicketDetailDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .subject(ticket.getSubject())
                .customerName(ticket.getPersonName())
                .email(ticket.getEmail())
                .company(
                        ticket.getPartner() != null && ticket.getPartner().getParent() != null
                                ? ticket.getPartner().getParent().getName()
                                : ticket.getPartner() != null
                                ? ticket.getPartner().getName()
                                : "-"
                )
                .priority(ticket.getPriority() != null ? ticket.getPriority().getName() : "-")
                .product(ticket.getProduct() != null ? ticket.getProduct().getName() : "-")
                .state(ticket.getStateName() != null ? ticket.getStateName() : "-")
                .channel(ticket.getChannel() != null ? ticket.getChannel() : "-")
                .assignedPic(resolveAssignedPicName(ticket))
                .hasAssignedPic(ticket.getUserId() != null)
                .firstResponseAt(ticket.getStartResolutionTime() != null ? ticket.getStartResolutionTime().toString() : "-")
                .resolutionStartAt(ticket.getStartResolutionTime() != null ? ticket.getStartResolutionTime().toString() : "-")
                .resolutionEndAt(ticket.getEndResolutionTime() != null ? ticket.getEndResolutionTime().toString() : "-")
                .firstResponseTime(ticket.getResponseTime() != null ? String.valueOf(ticket.getResponseTime()) : "-")
                .resolutionTime(ticket.getResolutionTime() != null ? String.valueOf(ticket.getResolutionTime()) : "-")
                .build();
    }

    private String resolveAssignedPicName(SupportTicket ticket) {
        if (ticket == null) return "-";

        try {
            if (ticket.getPicName() != null && !ticket.getPicName().isBlank()) {
                return ticket.getPicName();
            }
        } catch (Exception ignored) {
        }

        try {
            if (ticket.getUser() != null && ticket.getUser().getPartner() != null) {
                String name = ticket.getUser().getPartner().getName();
                if (name != null && !name.isBlank()) return name;
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    @Transactional
    public SupportTicket takeTicket(Long id, ResUsers currentUser) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setUserId(currentUser.getId());
        ticket.setWriteUid(currentUser.getId());
        ticket.setWriteDate(LocalDateTime.now());

        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public SupportTicket assignPic(Long id, Long userId) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setUserId(userId);
        ticket.setWriteUid(userId);
        ticket.setWriteDate(LocalDateTime.now());

        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public SupportTicket closeTicket(Long id, ResUsers currentUser, CloseTicketDTO dto) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        LocalDateTime nowDb = LocalDateTime.now().minusHours(7);

        WebsiteSupportTicketState closedState = ticketStateService.getStateByName("Staff Closed");

        if (closedState != null) {
            ticket.setStateId(closedState.getId());
            ticket.setStateName(closedState.getName());
        } else {
            ticket.setStateName("Staff Closed");
        }

        ticket.setCloseTime(nowDb);
        ticket.setCloseDate(nowDb.toLocalDate());
        ticket.setClosedById(currentUser.getId());
        ticket.setMailToRelated(true);
        ticket.setTelegramToRelated(true);
        ticket.setWriteUid(currentUser.getId());
        ticket.setWriteDate(LocalDateTime.now());

        SupportTicketMessage closingMessage = new SupportTicketMessage();
        closingMessage.setTicketId(ticket.getId());
        closingMessage.setUserId(currentUser.getId());
        closingMessage.setStateId(ticket.getStateId());
        closingMessage.setBy(resolveUserMessageBy(currentUser));
        closingMessage.setContent(
                dto != null && dto.getComment() != null && !dto.getComment().isBlank()
                        ? dto.getComment()
                        : "Support ticket has been closed."
        );
        closingMessage.setCreateDate(nowDb);
        closingMessage.setResponseTime(0.0);
        closingMessage.setResolutionTime(0.0);

        supportTicketMessageRepository.save(closingMessage);
        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public void hardDeleteTicket(Long id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket tidak ditemukan"));

        if ("Closed".equalsIgnoreCase(ticket.getStateName())) {
            throw new RuntimeException("Ticket sudah closed, tidak boleh dihapus");
        }

        jdbcTemplate.update("DELETE FROM ptap_attachment_ticket WHERE ticket_id = ?", id);
        jdbcTemplate.update("DELETE FROM ptap_emp_l2_ticket_rel WHERE ticket_id = ?", id);
        jdbcTemplate.update("DELETE FROM ptap_emp_l3_ticket_rel WHERE ticket_id = ?", id);
        jdbcTemplate.update("DELETE FROM ptap_emp_l4_ticket_rel WHERE ticket_id = ?", id);
        jdbcTemplate.update("DELETE FROM ptap_incident_log WHERE ticket_id = ?", id);
        jdbcTemplate.update("DELETE FROM ptap_pic_rating WHERE ticket_id = ?", id);
        jdbcTemplate.update("DELETE FROM ptap_web_ticket_hr_employee_rel WHERE ticket_id = ?", id);

        jdbcTemplate.update("DELETE FROM website_support_ticket_message WHERE ticket_id = ?", id);

        jdbcTemplate.update("DELETE FROM mail_followers WHERE res_model = 'website.support.ticket' AND res_id = ?", id);
        jdbcTemplate.update("DELETE FROM mail_activity WHERE res_model = 'website.support.ticket' AND res_id = ?", id);
        jdbcTemplate.update("DELETE FROM ir_attachment WHERE res_model = 'website.support.ticket' AND res_id = ?", id);
        jdbcTemplate.update("DELETE FROM mail_message WHERE model = 'website.support.ticket' AND res_id = ?", id);

        jdbcTemplate.update("DELETE FROM website_support_ticket WHERE id = ?", id);
    }
}