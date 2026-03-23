package com.pawforward.api.contact.dto;

import com.pawforward.api.contact.ContactInquiry;
import com.pawforward.api.contact.ContactInquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ContactInquiryResponse {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private String dogName;
    private String serviceInterest;
    private ContactInquiryStatus status;
    private String adminResponse;
    private Instant createdAt;

    public static ContactInquiryResponse from(ContactInquiry inquiry) {
        return ContactInquiryResponse.builder()
                .id(inquiry.getId())
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .phone(inquiry.getPhone())
                .subject(inquiry.getSubject())
                .message(inquiry.getMessage())
                .dogName(inquiry.getDogName())
                .serviceInterest(inquiry.getServiceInterest())
                .status(inquiry.getStatus())
                .adminResponse(inquiry.getAdminResponse())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
