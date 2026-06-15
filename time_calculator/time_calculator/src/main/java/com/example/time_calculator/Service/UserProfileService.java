package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResPartner;
import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResPartnerRepository;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.dto.UpdateUserProfileRequestDTO;
import com.example.time_calculator.dto.UserProfileResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final ResUsersRepository usersRepository;
    private final ResPartnerRepository partnerRepository;

    private String currentLogin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return auth.getName();
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDTO getCurrentUserProfile() {
        String login = currentLogin();

        ResUsers user = usersRepository
                .findDetailedByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found: " + login));

        List<String> roles = usersRepository.findGroupNamesByLogin(login);
        ResPartner partner = user.getPartner();

        String fullName = null;
        String email = null;
        String phone = null;

        if (partner != null) {
            fullName = (partner.getName() != null && !partner.getName().isBlank())
                    ? partner.getName()
                    : partner.getDisplayName();

            email = partner.getEmail();
            phone = partner.getPhone();
        }

        if (fullName == null || fullName.isBlank()) {
            fullName = user.getLogin();
        }

        if (email == null || email.isBlank()) {
            email = user.getLogin();
        }

        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .login(user.getLogin())
                .fullName(fullName)
                .email(email)
                .phone(phone)
                .language("English")
                .timezone("Asia/Jakarta")
                .notificationType(
                        user.getNotificationType() != null && !user.getNotificationType().isBlank()
                                ? user.getNotificationType()
                                : "handle_by_emails"
                )
                .chatterPosition(
                        user.getChatterPosition() != null && !user.getChatterPosition().isBlank()
                                ? user.getChatterPosition()
                                : "normal"
                )
                .signature(user.getSignature())
                .roles(roles)
                .createdAt(user.getCreateDate())
                .updatedAt(user.getWriteDate())
                .build();
    }

    @Transactional
    public UserProfileResponseDTO updateCurrentUserProfile(UpdateUserProfileRequestDTO req) {
        String login = currentLogin();

        ResUsers user = usersRepository
                .findDetailedByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found: " + login));

        ResPartner partner = user.getPartner();
        if (partner == null) {
            throw new RuntimeException("Partner data not found for user: " + login);
        }

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            partner.setName(req.getFullName().trim());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            partner.setEmail(req.getEmail().trim());
        }

        if (req.getPhone() != null) {
            partner.setPhone(req.getPhone().isBlank() ? null : req.getPhone().trim());
        }

        partnerRepository.save(partner);

        if (req.getNotificationType() != null) {
            user.setNotificationType(req.getNotificationType());
        }

        if (req.getChatterPosition() != null) {
            user.setChatterPosition(req.getChatterPosition());
        }

        if (req.getSignature() != null) {
            user.setSignature(req.getSignature());
        }

        user.setWriteDate(LocalDateTime.now());
        usersRepository.save(user);

        return getCurrentUserProfile();
    }
}