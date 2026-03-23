package com.pawforward.api.contact;

import com.pawforward.api.contact.dto.ContactInquiryRequest;
import com.pawforward.api.contact.dto.ContactInquiryResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ContactInquiryService {

    private final ContactInquiryRepository contactInquiryRepository;

    public ContactInquiryService(ContactInquiryRepository contactInquiryRepository) {
        this.contactInquiryRepository = contactInquiryRepository;
    }

    @Transactional
    public ContactInquiryResponse submitInquiry(ContactInquiryRequest request) {
        ContactInquiry inquiry = ContactInquiry.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .message(request.getMessage())
                .dogName(request.getDogName())
                .serviceInterest(request.getServiceInterest())
                .status(ContactInquiryStatus.NEW)
                .build();

        inquiry = contactInquiryRepository.save(inquiry);
        return ContactInquiryResponse.from(inquiry);
    }

    @Transactional(readOnly = true)
    public List<ContactInquiryResponse> getAllInquiries() {
        return contactInquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ContactInquiryResponse::from)
                .toList();
    }

    @Transactional
    public ContactInquiryResponse respondToInquiry(UUID inquiryId, String responseText) {
        ContactInquiry inquiry = contactInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("Contact inquiry not found"));

        inquiry.setAdminResponse(responseText);
        inquiry.setStatus(ContactInquiryStatus.RESOLVED);
        inquiry = contactInquiryRepository.save(inquiry);
        return ContactInquiryResponse.from(inquiry);
    }

    @Transactional
    public ContactInquiryResponse archiveInquiry(UUID inquiryId) {
        ContactInquiry inquiry = contactInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("Contact inquiry not found"));

        inquiry.setStatus(ContactInquiryStatus.CLOSED);
        inquiry = contactInquiryRepository.save(inquiry);
        return ContactInquiryResponse.from(inquiry);
    }
}
