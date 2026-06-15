package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.dto.SupportUserOptionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class SupportUserService {

    @Autowired
    private ResUsersRepository resUsersRepository;

    public List<SupportUserOptionDTO> getSupportUsers() {
        return resUsersRepository.findAllActiveInternalUsers()
                .stream()
                .map(user -> {
                    String employeeName = null;
                    String employeeEmail = null;

                    if (user.getEmployees() != null) {
                        var activeEmployee = user.getEmployees()
                                .stream()
                                .filter(emp -> Boolean.TRUE.equals(emp.getActive()))
                                .findFirst()
                                .orElse(null);

                        if (activeEmployee != null) {
                            employeeName = activeEmployee.getName();
                            employeeEmail = activeEmployee.getWorkEmail();
                        }
                    }

                    String fallbackName =
                            employeeName != null && !employeeName.isBlank()
                                    ? employeeName
                                    : user.getLogin();

                    return SupportUserOptionDTO.builder()
                            .id(user.getId())
                            .name(fallbackName)
                            .email(employeeEmail)
                            .build();
                })
                .sorted(Comparator.comparing(
                        SupportUserOptionDTO::getName,
                        String.CASE_INSENSITIVE_ORDER
                ))
                .toList();
    }
}